import mongoose, { Document, Model, Schema } from 'mongoose';

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
        validator: async (email: string) => {
          const emailCount = await mongoose.models.User.countDocuments({
            email,
          });
          return !emailCount;
        },
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

export const User: Model<Usermodel> = mongoose.model('User', schema);
