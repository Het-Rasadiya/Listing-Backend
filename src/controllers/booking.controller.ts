import type { Request, Response } from "express";
import { bookingModel } from "../models/booking.model.js";
import { listingModel } from "../models/listing.model.js";
import { userModel } from "../models/user.model.js";
import {
  sendBookingMail,
  sendConfirmationBookingMail,
} from "../services/mail.service.js";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const userId = (req as any).user?._id;
    const { checkIn, checkOut, guests } = req.body;

    if (!listingId || !userId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const listing = await listingModel.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (listing.owner.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot book your own listing" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return res
        .status(400)
        .json({ message: "Check-out must be after check-in" });
    }

    const overlappingBooking = await bookingModel.findOne({
      listing: listingId,
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    if (overlappingBooking) {
      return res
        .status(400)
        .json({ message: "Listing is not available for these dates" });
    }

    const diffInTime = checkOutDate.getTime() - checkInDate.getTime();
    const daysCount = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
    const totalPrice = listing.price * daysCount;

    const booking = await bookingModel.create({
      listing: listingId,
      customer: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      stayDay: daysCount,
      totalPrice,
    });

    const populatedBooking = await bookingModel
      .findById(booking._id)
      .populate("listing customer");
    const user = await userModel.findById(userId);
    if (user?.email && populatedBooking) {
      await sendBookingMail(user.email, populatedBooking);
    }

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const user = await userModel.findById(userId);
    if (!user?.admin) {
      return res.status(403).json({ message: "Access denied" });
    }
    const bookings = await bookingModel.find().populate("listing customer");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const bookings = await bookingModel
      .find({ customer: userId })
      .populate("listing");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

export const listingOwnerChangeBookingStatus = async (
  req: Request,
  res: Response,
) => {
  const { bookingId } = req.body;
  try {
    const booking = await bookingModel.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    const userId = (req as any).user._id;

    const isListingOwner =
      (booking.listing as any).owner.toString() === userId.toString();

    if (!isListingOwner) {
      return res.status(403).json({ message: "Access denied" });
    }
    const updatedBooking = await bookingModel
      .findByIdAndUpdate(
        bookingId,
        { status: req.body.status },
        { returnDocument: "after" },
      )
      .populate("listing customer");
    if (updatedBooking?.status === "confirmed") {
      const user = await userModel.findById(updatedBooking?.customer);
      if (user?.email && updatedBooking) {
        await sendConfirmationBookingMail(user.email, updatedBooking);
      }
    }
    return res.status(200).json(updatedBooking);
  } catch (error) {
    return res.status(400).json({ message: "Error updating booking status" });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const userId = (req as any).user._id;
    const booking = await bookingModel.findById(bookingId).populate("listing");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const isCustomer = booking.customer.toString() === userId.toString();
    const isAdmin = (await userModel.findById(userId))?.admin;
    const isListingOwner =
      (booking.listing as any).owner.toString() === userId.toString();

    if (!isCustomer && !isAdmin && !isListingOwner) {
      return res.status(403).json({ message: "Access denied" });
    }
    await bookingModel.findByIdAndDelete(bookingId);
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking" });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const booking = await bookingModel.findByIdAndUpdate(
      bookingId,
      { isPaid: true },
      { returnDocument: "after" },
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ message: "Error updating payment status" });
  }
};

export const ListingOwnerShowBookingDetails = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as any).user._id;
  const allListingOfOwner = await listingModel.find({
    owner: userId,
  });
  const listingIds = allListingOfOwner.map((listing) => listing._id);
  const bookings = await bookingModel
    .find({ listing: { $in: listingIds } })
    .populate("customer listing");

  res.status(200).json(bookings);
};
