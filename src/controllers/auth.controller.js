import crypto from 'crypto';
import {
  ApolloError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-core';
import config from 'config';
import userModel from '../models/user.model';
import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import errorHandler from './error.controller';
import Email from '../utils/email';

const cookieOptions = {
  httpOnly: true,
  // domain: 'localhost',
  sameSite: 'none',
  secure: true,
};

const accessTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
  expires: new Date(Date.now() + 15 * 60 * 1000),
};

const refreshTokenCookieOptions = {
  ...cookieOptions,
  maxAge: 60 * 60 * 1000,
  expires: new Date(Date.now() + 60 * 60 * 1000),
};

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

const signup = async (
  parent,
  { input: { name, email, password, passwordConfirm } },
  { req }
) => {
  try {
    const user = await userModel.create({
      name,
      email,
      password,
      passwordConfirm,
    });

    // Send email
    const verificationCode = user.createVerificationCode();
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get('host')}/${
      user.id
    }/${verificationCode}`;

    try {
      await new Email(user, url).sendVerificationCode();

      return {
        status: 'success',
        message: `We sent an email with a verification code to ${user.email}`,
        user,
      };
    } catch (error) {
      user.verificationCode = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApolloError('There was an error sending email');
    }
  } catch (error) {
    if (error.code === 11000) {
      throw new ForbiddenError('User already exist');
    }
    errorHandler(error);
  }
};

let refreshTokens = [];

async function signTokens(user) {
  // Create a Session
  await redisClient.set(user.id, JSON.stringify(user), {
    EX: 60 * 60,
  });

  // Create access token
  const accessToken = signJwt({ user: user.id }, 'JWT_ACCESS_PRIVATE_KEY', {
    expiresIn: config.get('jwtAccessTokenExpiresIn'),
  });

  // Create refresh token
  const refreshToken = signJwt({ user: user.id }, 'JWT_REFRESH_PRIVATE_KEY', {
    expiresIn: config.get('jwtRefreshTokenExpiresIn'),
  });

  return { accessToken, refreshToken };
}

const login = async (parent, { input: { email, password } }, { req, res }) => {
  try {
    // Check if user exist and password is correct
    const user = await userModel
      .findOne({ email })
      .select('+password +verified');

    if (!user || !(await user.comparePasswords(password, user.password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is verified
    if (!user.verified) {
      throw new AuthenticationError('Please verify your email');
    }

    user.password = undefined;

    // Create a session and tokens
    const { accessToken, refreshToken } = await signTokens(user);

    refreshTokens.push(refreshToken);

    // Add refreshToken to cookie
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    return {
      status: 'success',
      accessToken,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const verifyUser = async (parent, { id, code }) => {
  try {
    // Get the user
    const user = await userModel.findById(id).select('+verificationCode');

    const verificationCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    if (!user) {
      throw new AuthenticationError(`User with id: ${id} no longer exist`);
    }

    if (user.verificationCode !== verificationCode) {
      throw new AuthenticationError('Could not verify email address');
    }

    user.verified = true;
    user.verificationCode = undefined;
    await user.save({ validateBeforeSave: false });

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

const forgotPassword = async (parent, { email }, { req }) => {
  try {
    // Get the user from the collection
    const user = await userModel.findOne({ email }).select('+verified');

    const message =
      'You will receive a password reset email if user with that email exist';

    //  Send generic error if user  doesn't exist
    if (!user) {
      return {
        status: 'success',
        message,
      };
    }

    // Check if user is verified
    if (!user.verified) {
      throw new AuthenticationError('User not verified');
    }

    // Create the reset token
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const url = `${req.protocol}://${req.get('host')}/${resetToken}`;

    // Send password reset email
    try {
      await new Email(user, url).sendPasswordResetToken();

      return {
        status: 'success',
        message,
      };
    } catch (error) {
      user.passwordResetToken = undefined;
      user.passwordResetAt = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApolloError('There was a problem sending email');
    }
  } catch (error) {
    errorHandler(error);
  }
};

const resetPassword = async (
  parent,
  { input: { token, password, passwordConfirm } }
) => {
  try {
    // Get the user from the collection
    const resetToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await userModel.findOne({
      passwordResetToken: resetToken,
      passwordResetAt: { $gt: Date.now() },
    });

    if (!user) {
      throw new AuthenticationError('Token is invalid or has expired');
    }

    // Change password data
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetAt = undefined;
    await user.save();

    return {
      status: 'success',
      message:
        'Password data successfully updated, please login with your new credentials',
    };
  } catch (error) {
    errorHandler(error);
  }
};

const updatePassword = async (
  parent,
  { input: { passwordCurrent, password, passwordConfirm } },
  { getAuthUser, restrictTo, req, res }
) => {
  try {
    const authUser = await getAuthUser(req);

    if (!authUser) {
      throw new AuthenticationError('You are not logged in');
    }

    const role = restrictTo(authUser.role, 'user', 'admin');

    if (!role) {
      throw new ForbiddenError('You are not allowed to perform this action');
    }

    // Check if user's current password is correct
    const user = await userModel.findById(authUser.id).select('+password');

    if (
      !user ||
      !(await user.comparePasswords(passwordCurrent, user.password))
    ) {
      throw new AuthenticationError('Your current password is incorrect');
    }

    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();

    // Logout user
    res.cookie('accessToken', '', { maxAge: 1 });
    res.cookie('refreshToken', '', { maxAge: 1 });

    // res.redirect(config.get('origin'))

    return {
      status: 'success',
      message: 'Password data updated, please login with your new credentials',
    };
  } catch (error) {
    errorHandler(error);
  }
};

const refreshAccessToken = async (parent, args, { req, res }) => {
  try {
    // Get the refresh token
    const { refreshToken } = req.cookies;

    // Validate the RefreshToken
    const decoded = verifyJwt(refreshToken, 'JWT_REFRESH_PUBLIC_KEY');

    if (!decoded) {
      throw new ForbiddenError('Could not refresh access token');
    }

    // Check if user's session is valid
    const session = await redisClient.get(decoded.user);

    if (!session) {
      throw new ForbiddenError('User session has expired');
    }

    // Check if user exist and is verified
    const user = await userModel
      .findById(JSON.parse(session)._id)
      .select('+verified +active');

    if (!user || !user.verified || !user.active) {
      throw new ForbiddenError('Could not refresh access token');
    }

    // Check if user already use this refresh token
    if (!refreshTokens.includes(refreshToken)) {
      throw new ForbiddenError('Refresh token can only be used once');
    }

    // Sign new access token
    const accessToken = signJwt({ user: user._id }, 'JWT_ACCESS_PRIVATE_KEY', {
      expiresIn: config.get('jwtAccessTokenExpiresIn'),
    });

    // Send access token cookie
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    return {
      status: 'success',
      accessToken,
    };
  } catch (error) {
    errorHandler(error);
  }
};

export default {
  signup,
  login,
  verifyUser,
  forgotPassword,
  resetPassword,
  updatePassword,
  refreshAccessToken,
};
