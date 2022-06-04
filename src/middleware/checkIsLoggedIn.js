import { AuthenticationError, ForbiddenError } from 'apollo-server-core';
import errorHandler from '../controllers/error.controller';

const checkIsLoggedIn = async (req, getAuthUser, restrictTo, ...roles) => {
  try {
    // Check if user is logged in
    const authUser = await getAuthUser(req);

    if (!authUser) {
      throw new AuthenticationError('You are not logged in');
    }

    // Check if user is admin
    const allowedUser = restrictTo(authUser.role, roles);
    if (!allowedUser) {
      throw new ForbiddenError('You are not allowed to perform this action');
    }
  } catch (error) {
    errorHandler(error);
  }
};

export default checkIsLoggedIn;
