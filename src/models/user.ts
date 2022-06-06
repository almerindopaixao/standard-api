import mongoose, { Document, Model, Schema } from 'mongoose';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
}

interface Usermodel extends Omit<User, '_id'>, Document {}

const schema = new Schema(
  {
    name: {
      type: String,
      require: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'E-mail is required'],
      unique: [true, 'E-mail must be unique'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
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
