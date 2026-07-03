import type { Request, Response } from "express";
import Stripe from "stripe";

export const createPayment = async (req: Request, res: Response) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const { listing, bookingId, stayDay } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: listing.title,
              images: [listing.images[0]],
            },
            unit_amount: listing.price * stayDay * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5173/profile?success=true&bookingId=${bookingId}`,
      cancel_url: "http://localhost:5173/profile",
      metadata: { bookingId },
    });
    res.json({
      url: session.url,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
