import mongoose from 'mongoose';
import productModel from './product.model';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
      minlength: [10, 'Review must be more than 10 characters'],
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Rating must be more than 0'],
      max: [5, 'Rating must be less than 5'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review must belong to a user'],
      ref: 'User',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Review must belong to a product'],
      ref: 'Product',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

reviewSchema.post('save', function () {
  this.constructor.calcRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  if (!this.review) return;
  this.review.constructor.calcRating(this.review.product);
});

reviewSchema.statics.calcRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await productModel.findByIdAndUpdate(
      productId,
      {
        numRating: stats[0].numRating,
        avgRating: stats[0].avgRating,
      },
      { lean: true }
    );
  } else {
    await productModel.findByIdAndUpdate(
      productId,
      {
        numRating: 0,
        avgRating: 0,
      },
      { lean: true }
    );
  }
  console.log(stats);
};

const reviewModel = mongoose.model('Review', reviewSchema);
export default reviewModel;
