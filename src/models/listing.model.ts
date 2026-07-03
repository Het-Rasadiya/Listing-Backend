import mongoose from "mongoose";

interface Listing {
  title: string;
  description?: string;
  price: number;
  images: string[];
  location: string;
  category:
    | "rooms"
    | "beachfront"
    | "cabins"
    | "trending"
    | "city"
    | "countryside";
  owner: mongoose.Types.ObjectId;
  reviews?: mongoose.Types.ObjectId[];
  geometry: {
    type: {
      type: String;
      enum: ["Point"];
      required: true;
    };
    coordinates: {
      type: [Number];
      required: true;
    };
  };
}

interface ListingDocument extends Listing, mongoose.Document {}

const listingSchema = new mongoose.Schema<ListingDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is  Required"],
      index: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      required: [true, "Price is Required"],
    },
    images: {
      type: [String],
      required: [true, "Image is Required"],
    },

    location: {
      type: String,
      required: [true, "Location is Required"],
    },
    category: {
      type: String,
      enum: {
        values: [
          "rooms",
          "beachfront",
          "cabins",
          "trending",
          "city",
          "countryside",
        ],
        message: "Invalid category",
      },
      default: "rooms",
      index: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is Required"],
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const listingModel = mongoose.model<ListingDocument>(
  "Listing",
  listingSchema,
);
