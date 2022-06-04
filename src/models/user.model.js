import mongoose from 'mongoose';
import crypto from 'crypto';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be more than 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: 'Passwords do not match',
      },
    },
    photo: {
      type: String,
      default: 'default.jpeg',
    },
    role: {
      type: String,
      default: 'user',
    },
    verified: {
      type: Boolean,
      default: false,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetAt: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.index({ email: 1 });

userSchema.pre('save', async function (next) {
  // Check if the password has been modified
  if (!this.isModified('password')) return next();

  // Hash password with strength of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove the password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.comparePasswords = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.createVerificationCode = function () {
  const verificationCode = crypto.randomBytes(32).toString('hex');

  this.verificationCode = crypto
    .createHash('sha256')
    .update(verificationCode)
    .digest('hex');

  return verificationCode;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetAt = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const userModel = mongoose.model('User', userSchema);
export default userModel;
