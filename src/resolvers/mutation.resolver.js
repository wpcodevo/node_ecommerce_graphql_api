import categoryController from '../controllers/category.controller';
import productController from '../controllers/product.controller';
import authController from '../controllers/auth.controller';
import reviewController from '../controllers/review.controller';
import userController from '../controllers/user.controller';

export default {
  // Product
  createProduct: productController.createProduct,
  updateProduct: productController.updateProduct,
  deleteProduct: productController.deleteProduct,
  // Category
  createCategory: categoryController.createCategory,
  deleteCategory: categoryController.deleteCategory,
  updateCategory: categoryController.updateCategory,
  // Auth
  signupUser: authController.signup,
  loginUser: authController.login,
  verifyUser: authController.verifyUser,
  forgotPassword: authController.forgotPassword,
  resetPassword: authController.resetPassword,
  updatePassword: authController.updatePassword,
  // Reviews
  createReview: reviewController.createReview,
  updateReview: reviewController.updateReview,
  deleteReview: reviewController.deleteReview,
  // Users
  createUser: userController.createUser,
  updateUser: userController.updateUser,
  deleteUser: userController.deleteUser,
  getMe: userController.getMe,
  updateMe: userController.updateMe,
  deleteMe: userController.deleteMe,
};
