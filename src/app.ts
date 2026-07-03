import dotenv from "dotenv";
dotenv.config();
import express, { type Application } from "express";
import cookieParser from "cookie-parser";
import { dbConnection } from "./config/db.js";
import errorHandler from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/listing.route.js";
import reviewRoutes from "./routes/review.route.js";
import bookingRoutes from "./routes/booking.route.js";
import paymentRoutes from "./routes/payment.routes.js";
import likeRoutes from "./routes/like.route.js";
import cors from "cors";

// Initialize database connection immediately at the top level
dbConnection();

export const app: Application = express();

app.use(
  cors({
    origin: process.env.VITE_FRONTEND_BASE_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/listing", listingRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/like", likeRoutes);

app.use(errorHandler);

// Only listen to port if not in a Vercel Serverless environment
if (!process.env.VERCEL) {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}

export default app;
