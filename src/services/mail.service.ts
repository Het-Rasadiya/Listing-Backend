import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

transporter.verify((error: any, success: any) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: `"ListingHouse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export const sendBookingMail = async (to: string, booking: any) => {
  const listing = booking.listing;
  const customer = booking.customer;
  const statusText =
    booking.status === "pending"
      ? "Waiting for Confirmation"
      : booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
  const statusColor =
    booking.status === "pending"
      ? "#FFA500"
      : booking.status === "confirmed"
        ? "#28a745"
        : "#dc3545";
  const listingImage = listing.images?.[0] || "";

  const subject = "Booking Confirmation - ListingHouse";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: #fff; background-color: ${statusColor}; }
        .property-image { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; }
        .price-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 ListingHouse</h1>
          <p style="color: #fff; margin: 10px 0 0 0;">Booking Confirmation</p>
        </div>
        <div class="content">
          <p style="font-size: 18px; color: #333;">Dear ${customer.username},</p>
          <p style="color: #555;">Your booking has been successfully created!</p>
          <div style="margin: 20px 0;">
            <span class="status-badge">${statusText}</span>
          </div>
          ${listingImage ? `<img src="${listingImage}" alt="${listing.title}" class="property-image" />` : ""}
          <h2 style="margin: 20px 0 10px 0; color: #333;">${listing.title}</h2>
          <p style="color: #666; margin: 0 0 20px 0;">📍 ${listing.location}</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <div class="detail-row"><span><strong>Booking ID:</strong></span><span>${booking._id}</span></div>
            <div class="detail-row"><span><strong>Check-in:</strong></span><span>${new Date(booking.checkIn).toLocaleDateString()}</span></div>
            <div class="detail-row"><span><strong>Check-out:</strong></span><span>${new Date(booking.checkOut).toLocaleDateString()}</span></div>
            <div class="detail-row"><span><strong>Guests:</strong></span><span>${booking.guests}</span></div>
            <div class="detail-row"><span><strong>Stay Duration:</strong></span><span>${booking.stayDay} nights</span></div>
            <div class="detail-row" style="border: none;"><span><strong>Price/night:</strong></span><span>₹${listing.price}</span></div>
          </div>
          <div class="price-box">Total: ₹${booking.totalPrice}</div>
          <p style="color: #555; line-height: 1.6;">${booking.status === "pending" ? "⏳ Your booking is pending. The property owner will confirm shortly." : "We look forward to hosting you!"}</p>
        </div>
        <div class="footer">
          <p style="margin: 0;">Thank you for choosing ListingHouse!</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail(to, subject, html);
};

export const sendConfirmationBookingMail = async (to: string, booking: any) => {
  const listing = booking.listing;
  const customer = booking.customer;
  const listingImage = listing.images?.[0] || "";

  const subject = "🎉 Booking Confirmed - ListingHouse";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .success-badge { display: inline-block; padding: 12px 24px; border-radius: 25px; font-weight: bold; color: #fff; background-color: #28a745; font-size: 16px; }
        .property-image { width: 100%; height: 250px; object-fit: cover; border-radius: 8px; }
        .detail-row { padding: 12px 0; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; }
        .price-box { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .highlight-box { background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        .check-icon { font-size: 48px; color: #28a745; text-align: center; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 ListingHouse</h1>
          <p style="color: #fff; margin: 10px 0 0 0;">Booking Confirmed!</p>
        </div>
        <div class="content">
          <div class="check-icon">✅</div>
          <p style="font-size: 18px; color: #333; text-align: center;">Great news, ${customer.username}!</p>
          <p style="color: #555; text-align: center; font-size: 16px;">Your booking has been <strong>CONFIRMED</strong> by the property owner!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="success-badge">✓ CONFIRMED</span>
          </div>
          
          ${listingImage ? `<img src="${listingImage}" alt="${listing.title}" class="property-image" />` : ""}
          <h2 style="margin: 20px 0 10px 0; color: #333;">${listing.title}</h2>
          <p style="color: #666; margin: 0 0 20px 0;">📍 ${listing.location}</p>
          
          <div class="highlight-box">
            <h3 style="margin: 0 0 15px 0; color: #155724;">🎯 Your Confirmed Booking Details</h3>
            <div class="detail-row"><span><strong>Booking ID:</strong></span><span>${booking._id}</span></div>
            <div class="detail-row"><span><strong>Check-in:</strong></span><span>${new Date(booking.checkIn).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></div>
            <div class="detail-row"><span><strong>Check-out:</strong></span><span>${new Date(booking.checkOut).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></div>
            <div class="detail-row"><span><strong>Guests:</strong></span><span>${booking.guests} ${booking.guests === 1 ? "Guest" : "Guests"}</span></div>
            <div class="detail-row"><span><strong>Stay Duration:</strong></span><span>${booking.stayDay} ${booking.stayDay === 1 ? "Night" : "Nights"}</span></div>
            <div class="detail-row" style="border: none;"><span><strong>Price per night:</strong></span><span>₹${listing.price}</span></div>
          </div>
          
          <div class="price-box">Total Confirmed Amount: ₹${booking.totalPrice}</div>
          
         
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">📋 Next Steps:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li>Complete your payment using the Pay Now button above</li>
              <li>Save this confirmation email for your records</li>
              <li>Contact the property owner if you have any questions</li>
              <li>Arrive at the check-in time specified</li>
              <li>Have a wonderful stay!</li>
            </ul>
          </div>
            </ul>
          </div>
          
          <p style="color: #555; line-height: 1.6; text-align: center; font-size: 16px;">
            🌟 We're excited for your upcoming stay! If you need any assistance, don't hesitate to contact us.
          </p>
        </div>
        
        <div class="footer">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Thank you for choosing ListingHouse!</p>
          <p style="margin: 0; font-size: 12px;">Have questions? Contact our support team anytime.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail(to, subject, html);
};


