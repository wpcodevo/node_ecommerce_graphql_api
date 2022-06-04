import { ApolloError } from 'apollo-server-core';
import errorHandler from './error.controller';
import userModel from '../models/user.model';
import checkIsLoggedIn from '../middleware/checkIsLoggedIn';

const filteredObj = (inputObj, ...allowedFields) => {
  const newObj = {};
  Object.keys(inputObj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = inputObj[el];
    }
  });

  return newObj;
};

const getMe = async (_, args, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    return await getAuthUser(req);
  } catch (error) {
    errorHandler(error);
  }
};

const updateMe = async (_, { input }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    const filter = filteredObj(input, 'name', 'photo', 'email');

    const { id } = await getAuthUser(req);

    const user = await userModel.findByIdAndUpdate(id, filter, {
      runValidators: true,
      new: true,
      lean: true,
    });

    if (!user) {
      throw new ApolloError(`User with id: ${id} not found`);
    }

    return {
      status: 'success',
      message:
        'Your profile has been updated, please login with your new credentials',
      user: {
        id: user._id,
        ...user,
      },
    };
  } catch (error) {
    errorHandler(error);
  }
};

const deleteMe = async (_, args, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    const { id } = await getAuthUser(req);

    const user = await userModel.findByIdAndUpdate(
      id,
      { active: false },
      {
        runValidators: true,
        lean: true,
      }
    );

    if (!user) {
      throw new ApolloError(`User with id: ${id} not found`);
    }

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

const getUsers = async (_, args, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const users = await userModel
      .find()
      .select('+verified +active +passwordChangedAt');

    return {
      status: 'success',
      results: users.length,
      users,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const getUser = async (_, { id }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const user = await userModel
      .findById(id, {}, { lean: true })
      .select('+verified +active +passwordChangedAt');

    if (!user) {
      throw new ApolloError(`Document with id: ${id} not found`);
    }

    return {
      id: user._id,
      ...user,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const createUser = async (_, { input }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    return await userModel.create(input);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApolloError('User with that email already exist');
    }
    errorHandler(error);
  }
};

const updateUser = async (
  _,
  { id, input },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const user = await userModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
      lean: true,
    });

    if (!user) {
      throw new ApolloError(`Document with id: ${id} not found`);
    }

    return {
      id: user._id,
      ...user,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const deleteUser = async (_, { id }, { req, res, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const user = await userModel.findByIdAndUpdate(
      id,
      { active: false },
      { lean: true }
    );

    if (!user) {
      throw new ApolloError(`Document with id: ${id} not found`);
    }

    res.cookie('accessToken', '', { maxAge: 1 });
    res.cookie('refreshToken', '', { maxAge: 1 });

    // res.redirect(config.get('origin'))

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

export default {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  getMe,
  updateMe,
  deleteMe,
};
