import categoryController from '../controllers/category.controller';
import productController from '../controllers/product.controller';
import reviewController from '../controllers/review.controller';
import userController from '../controllers/user.controller';
import authController from '../controllers/auth.controller';

export default {
  // Category
  categories: categoryController.getCategories,
  category: categoryController.getCategory,
  // Product
  products: productController.getProducts,
  product: productController.getProduct,
  // Review
  review: reviewController.getReview,
  reviews: reviewController.getReviews,
  // User
  user: userController.getUser,
  users: userController.getUsers,
  // Auth
  refreshAccessToken: authController.refreshAccessToken,
};
