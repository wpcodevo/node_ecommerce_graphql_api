import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.virtual('products', {
  foreignField: 'category',
  localField: '_id',
  ref: 'Product',
});

const categoryModel = mongoose.model('Category', categorySchema);
export default categoryModel;
