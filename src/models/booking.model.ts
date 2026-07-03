import mongoose, { Document } from "mongoose";

export interface IBooking {
  listing: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  stayDay: number;
  status: "pending" | "confirmed" | "cancelled";
  isPaid: boolean;
}

export interface IBookingDocument extends IBooking, Document {}

const bookingSchema = new mongoose.Schema<IBookingDocument>({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  stayDay: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

export const bookingModel = mongoose.model<IBookingDocument>(
  "Booking",
  bookingSchema,
);
