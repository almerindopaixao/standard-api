import mongoose, { Document, Model, Schema } from 'mongoose';
import { AuthService } from '@src/services/auth';
import { EmailValidator } from '@src/validators/email';
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

export enum CUSTOM_VALIDATION {
  DUPLICATED = 'DUPLICATED',
}

interface Usermodel extends Omit<User, '_id'>, Document {}

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'is required.'],
    },
    email: {
      type: String,
      required: [true, 'is required.'],
      unique: [true, 'must be unique.'],
      validate: {
        validator: EmailValidator.duplicated,
        type: CUSTOM_VALIDATION.DUPLICATED,
        message: 'already exists in the database.',
      },
    },
    password: {
      type: String,
      required: [true, 'is required.'],
    },
  },
  {
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

schema.pre<Usermodel>('save', async function (next): Promise<void> {
  try {
    if (!this.password || !this.isModified('password')) return next();

    const hash = await AuthService.hashPassword(this.password);

    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

export const User: Model<Usermodel> = mongoose.model('User', schema);
