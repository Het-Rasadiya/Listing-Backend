import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface User {
  username: string;
  email: string;
  password: string;
  admin: boolean;
}

interface UserDocument extends User, mongoose.Document {
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a user"],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Invalid Email address",
      ],
      unique: [true, "Email already exists."],
    },
    username: {
      type: String,
      required: [true, "Name is required for creating a user"],
      trim: true,
      unique: [true, "Username already exists."],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  return;
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

export const userModel = mongoose.model<UserDocument>("User", userSchema);
