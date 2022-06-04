import { ApolloError, ForbiddenError } from 'apollo-server-core';
import checkIsLoggedIn from '../middleware/checkIsLoggedIn';
import categoryModel from '../models/category.model';
import errorHandler from './error.controller';

const createCategory = async (
  parent,
  { input },
  { req, restrictTo, getAuthUser }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    return categoryModel.create(input);
  } catch (error) {
    if (error.code === 11000) {
      throw new ForbiddenError('Category with that name already exist');
    }
    errorHandler(error);
  }
};

const getCategories = async (_, args, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const categories = await categoryModel
      .find()
      .populate({ path: 'products' });

    return {
      status: 'success',
      results: categories.length,
      categories,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const getCategory = async (
  parent,
  { id },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const category = await categoryModel
      .findById(id)
      .populate({ path: 'products' });

    if (!category) {
      throw new ApolloError(
        `Review with id: ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return category;
  } catch (error) {
    errorHandler(error);
  }
};

const updateCategory = async (
  _,
  { id, input },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const category = await categoryModel.findByIdAndUpdate(id, input, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      throw new ApolloError(
        `Document with id ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return category;
  } catch (error) {
    errorHandler(error);
  }
};

const deleteCategory = async (
  parent,
  { id },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      throw new ApolloError(
        `Document with id ${id} not found`,
        'BAD_USER_INPUT'
      );
    }

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

export default {
  createCategory,
  getCategories,
  getCategory,
  deleteCategory,
  updateCategory,
};
