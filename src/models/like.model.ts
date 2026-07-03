import mongoose from "mongoose";

export interface ILike {
  listing: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const likeSchema = new mongoose.Schema<ILike>({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const likeModel = mongoose.model<ILike>("Like", likeSchema);
