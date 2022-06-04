import { ApolloError } from 'apollo-server-core';
import errorHandler from '../controllers/error.controller';
import userModel from '../models/user.model';
import redisClient from '../utils/connectRedis';
import { verifyJwt } from '../utils/jwt';

const authUser = async (req) => {
  try {
    // Get the access token
    let accessToken;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      accessToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      const { accessToken: token } = req.cookies;
      accessToken = token;
    }

    if (!accessToken) return false;

    // Validate the Access token
    const decoded = verifyJwt(accessToken, 'JWT_ACCESS_PUBLIC_KEY');

    if (!decoded) return false;

    // Check if the session is valid
    const session = await redisClient.get(decoded.user);

    if (!session) {
      throw new ApolloError('Session has expired');
    }

    // Check if user exist
    const user = await userModel
      .findById(JSON.parse(session).id)
      .select('+verified');

    if (!user || !user.verified) {
      throw new ApolloError('The user belonging to this token no logger exist');
    }

    return user;
  } catch (error) {
    errorHandler(error);
  }
};

export default authUser;
