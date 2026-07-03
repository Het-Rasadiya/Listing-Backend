import type { Request, Response } from "express";
import { reviewModel } from "../models/review.model.js";
import { listingModel } from "../models/listing.model.js";

export const createReview = async (req: Request, res: Response) => {
  const { comment, rating } = req.body;
  const { listingId } = req.params;

  if (!comment || !rating) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const review = await reviewModel.create({
      comment,
      rating,
      owner: (req as any).user?._id,
      listing: listingId as string,
    });

    const listing = await listingModel.findByIdAndUpdate(
      listingId,
      {
        $push: { reviews: review._id },
      },
      {
        returnDocument: "after",
      },
    );

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      listing,
      review,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getReviewofListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  try {
    const listing = await listingModel.findById(listingId).populate({
      path: "reviews",
      populate: {
        path: "owner",
        select: "username",
      },
    });
    return res.status(200).json({
      success: true,
      data: listing?.reviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteReviewofListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const { reviewId } = req.body;
  try {
    const listing = await listingModel.findById(listingId);
    if (!listing || !listing.reviews) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }
    listing.reviews = listing.reviews.filter(
      (review) => review.toString() !== reviewId,
    );
    await listing.save();
    await reviewModel.findByIdAndDelete(reviewId);
    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
