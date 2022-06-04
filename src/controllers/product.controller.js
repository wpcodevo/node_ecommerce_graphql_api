import { ForbiddenError, ValidationError } from 'apollo-server-core';
import checkIsLoggedIn from '../middleware/checkIsLoggedIn';
import productModel from '../models/product.model';
import errorHandler from './error.controller';

const createProduct = async (
  _,
  { input },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    return await productModel.create(input);
  } catch (error) {
    if (error.code === 11000) {
      throw ForbiddenError('Product with that name already exist');
    }
    errorHandler(error);
  }
};

const getProducts = async () => {
  try {
    const products = await productModel.find();

    return {
      status: 'success',
      results: products.length,
      products,
    };
  } catch (error) {
    errorHandler(error);
  }
};

const updateProduct = async (
  _,
  { id, input },
  { req, getAuthUser, restrictTo }
) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const product = await productModel.findByIdAndUpdate(id, input, {
      runValidators: true,
      new: true,
    });

    if (!product) {
      throw new ValidationError(`Document with id ${id} not found`);
    }

    return product;
  } catch (error) {
    errorHandler(error);
  }
};

const getProduct = async (_, { id }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin', 'user');

    const product = await productModel.findById(id).populate('reviews');

    if (!product) {
      throw new ValidationError(`Document with id ${id} not found`);
    }

    return product;
  } catch (error) {
    errorHandler(error);
  }
};

const deleteProduct = async (_, { id }, { req, getAuthUser, restrictTo }) => {
  try {
    await checkIsLoggedIn(req, getAuthUser, restrictTo, 'admin');

    const product = await productModel.findByIdAndDelete(id);

    if (!product) {
      throw new ValidationError(`Document with id ${id} not found`);
    }

    return true;
  } catch (error) {
    errorHandler(error);
  }
};

export default {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
