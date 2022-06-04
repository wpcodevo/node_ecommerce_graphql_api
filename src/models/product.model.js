import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      minlength: 10,
    },
    quantity: {
      type: Number,
      min: 1,
      default: 1,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    imageCover: {
      type: String,
      required: true,
    },
    images: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category',
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    numRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual('reviews', {
  foreignField: 'product',
  localField: '_id',
  ref: 'Review',
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({ path: 'category' });
  next();
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;
