import mongoose from "mongoose";

interface Review {
  comment: string;
  rating: number;
  owner: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
}

interface ReviewDocument extends Review, mongoose.Document {}

const reviewSchema = new mongoose.Schema<ReviewDocument>(
  {
    comment: {
      type: String,
      required: [true, "Comment is Required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is Required"],
      min: 1,
      max: 5,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is Required"],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "Listing is Required"],
    },
  },
  {
    timestamps: true,
  },
);

export const reviewModel = mongoose.model<ReviewDocument>(
  "Review",
  reviewSchema,
);
