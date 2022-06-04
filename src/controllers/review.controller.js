import { ApolloError } from 'apollo-server-core';
import checkIsLoggedIn from '../middleware/checkIsLoggedIn';
import reviewModel from '../models/reviews.model';
import errorHandler from './error.controller';

const getReviews = async (_, args, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    return await reviewModel.find();
  } catch (error) {
    errorHandler(error);
  }
};

const createReview = async (_, { input }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user');

    return await reviewModel.create(input);
  } catch (error) {
    errorHandler(error);
  }
};

const getReview = async (_, { id }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    const review = await reviewModel.findById(id, {}, { lean: true });

    if (!review) {
      throw new ApolloError(
        `Review with id: ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return {
      id: review._id,
      ...review,
    };
  } catch (error) {
    errorHandler(error);
  }
};
const updateReview = async (
  _,
  { id, input },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    const review = await reviewModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
      lean: true,
    });

    if (!review) {
      throw new ApolloError(
        `Review with id: ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return {
      id: review._id,
      ...review,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const deleteReview = async (_, { id }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'user', 'admin');

    const review = await reviewModel.findByIdAndDelete(id, { lean: true });

    if (!review) {
      throw new ApolloError(
        `Review with id: ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

export default {
  createReview,
  updateReview,
  deleteReview,
  getReviews,
  getReview,
};
