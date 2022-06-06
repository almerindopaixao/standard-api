import mongoose from 'mongoose';

export class EmailValidator {
  public static async duplicated(email: string): Promise<boolean> {
    const emailCount = await mongoose.models.User.countDocuments({
      email,
    });
    return !emailCount;
  }
}
