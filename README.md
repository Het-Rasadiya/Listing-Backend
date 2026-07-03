# Listing House MERN - Backend API Documentation

This documentation provides a comprehensive guide to the models and API endpoints of the Listing House Backend.

---

## Data Models

> **Note**: For a detailed Entity-Relationship diagram, please refer to the [`database_diagram.md`](../database_diagram.md) file in the project root.

### 1. User

Represents an application user or admin.

- `_id`: ObjectId
- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, min 6 chars)
- `admin`: Boolean (default: false)

### 2. Listing

Represents a property listing created by an owner.

- `_id`: ObjectId
- `title`: String (required)
- `description`: String
- `price`: Number (required)
- `images`: [String] (Cloudinary image URLs)
- `location`: String (required)
- `category`: String (enum: rooms, beachfront, cabins, trending, city, countryside)
- `owner`: ObjectId (Ref: User)
- `reviews`: [ObjectId] (Ref: Review)
- `geometry`: { type: "Point", coordinates: [Number, Number] } (GeoJSON)

### 3. Booking

Represents a user booking for a listing.

- `_id`: ObjectId
- `listing`: ObjectId (Ref: Listing)
- `customer`: ObjectId (Ref: User)
- `checkIn`: Date (required)
- `checkOut`: Date (required)
- `guests`: Number (required)
- `stayDay`: Number
- `totalPrice`: Number
- `status`: String (enum: pending, confirmed, cancelled)
- `isPaid`: Boolean (default: false)

### 4. Review

Represents a review placed by a user on a listing.

- `_id`: ObjectId
- `comment`: String (required)
- `rating`: Number (required, 1-5)
- `owner`: ObjectId (Ref: User)
- `listing`: ObjectId (Ref: Listing)

### 5. Like

Represents a user favoriting a listing.

- `_id`: ObjectId
- `listing`: ObjectId (Ref: Listing)
- `user`: ObjectId (Ref: User)

---

## API Endpoints

### 1. User Routes (`/api/user`)

#### `POST /register`

Registers a new user account and securely sets a 24-hour JWT cookie.

- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Responses:**
  - `201 Created`: Returns user object and JWT token.
  - `400 Bad Request`: "All fields are required"
  - `409 Conflict`: "User already exists"

#### `POST /login`

Authenticates a user and securely sets a 24-hour JWT cookie.

- **Request Body:**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Responses:**
  - `200 OK`: Returns authenticated user and token.
  - `400 Bad Request`: "All fields are required"
  - `401 Unauthorized`: "Invalid credentials"
  - `404 Not Found`: "User not found"

#### `POST /logout`

Logs out the user by clearing the JWT cookie.

- **Responses:**
  - `200 OK`: "User logged out Successfully"

#### `GET /profile`

Gets the details of the currently authenticated user.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Responses:**
  - `200 OK`: `{ user: { ... } }`

#### `GET /admin`

Gets overview statistics and lists for the admin dashboard.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Admin Role)
- **Responses:**
  - `200 OK`: Returns totals and lists for users, listings, reviews, and bookings.
  - `404 Not Found`: "Admin access required"

---

### 2. Listing Routes (`/api/listing`)

#### `POST /`

Creates a new property listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Request Body:** (FormData - requires `multipart/form-data`)
  - `title` (string)
  - `description` (optional string)
  - `price` (number)
  - `category` (string, enum)
  - `location` (string)
  - `coordinates` (JSON string `[lng, lat]`)
  - `images` (Max 5 files)
- **Responses:**
  - `201 Created`: "Listing created successfully"
  - `400 Bad Request`: "All fields are required" / "At least one image is required"
  - `500 Internal Server Error`: "Failed to create listing"

#### `GET /`

Fetches all listings with optional query filtering.

- **Query Parameters:**
  - `search` (Search title/location)
  - `category` (Filter by category)
  - `minPrice` / `maxPrice` (Filter by price range)
- **Responses:**
  - `200 OK`: `{ success: true, data: [ListingObjects] }`

#### `GET /user-listing`

Fetches all listings created by the authenticated owner.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Responses:**
  - `200 OK`: `{ success: true, data: [ListingObjects] }`

#### `GET /csv-data`

Downloads the authenticated user's listings as a CSV file.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Responses:**
  - `200 OK`: CSV File Stream
  - `404 Not Found`: "No listings to export"

#### `GET /:id`

Gets a specific listing by its ID.

- **Parameters:** `id` (Listing ObjectId)
- **Responses:**
  - `200 OK`: `{ success: true, data: ListingObject }`
  - `404 Not Found`: "Listing not found"

#### `PUT /:listingId`

Updates a specific listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Ownership)
- **Parameters:** `listingId` (Listing ObjectId)
- **Request Body:** (FormData - similar to `POST /`)
- **Responses:**
  - `200 OK`: "Listing updated successfully"
  - `403 Forbidden`: "You are not authorized to update this listing"
  - `404 Not Found`: "Listing not found"

#### `DELETE /:listingId`

Deletes a specific listing entirely.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Admin/Ownership)
- **Parameters:** `listingId` (Listing ObjectId)
- **Responses:**
  - `200 OK`: "Listing deleted successfully"
  - `403 Forbidden`: "You are not authorized to delete this listing"
  - `404 Not Found`: "Listing not found"

#### `DELETE /:id/image`

Deletes an individual image from a listing.

- **Parameters:** `id` (Listing ObjectId)
- **Request Body:**
  ```json
  { "imageUrl": "https://res.cloudinary.com/..." }
  ```
- **Responses:**
  - `200 OK`: "Image deleted successfully"
  - `400 Bad Request`: "At least one image is required"

---

### 3. Booking Routes (`/api/booking`)

#### `POST /:listingId`

Creates a booking for a listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Parameters:** `listingId` (Listing ObjectId)
- **Request Body:**
  ```json
  {
    "checkIn": "2024-12-01T12:00:00.000Z",
    "checkOut": "2024-12-05T12:00:00.000Z",
    "guests": 2
  }
  ```
- **Responses:**
  - `201 Created`: Returns created Booking object.
  - `400 Bad Request`: "You cannot book your own listing" / "Listing is not available for these dates"
  - `404 Not Found`: "Listing not found"

#### `GET /`

Fetches all platform bookings.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Admin Role)
- **Responses:**
  - `200 OK`: Returns array of populated booking objects.
  - `403 Forbidden`: "Access denied"

#### `GET /all`

Fetches bookings made on properties owned by the authenticated user.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Responses:**
  - `200 OK`: Returns array of booking objects for the owner.

#### `GET /user`

Fetches bookings made by the authenticated customer.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Responses:**
  - `200 OK`: Returns array of user's personal bookings.

#### `PUT /status`

Owner accepts or rejects a pending booking.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Property Ownership)
- **Request Body:**
  ```json
  {
    "bookingId": "65b2...",
    "status": "confirmed" // or "cancelled"
  }
  ```
- **Responses:**
  - `200 OK`: Returns updated booking object.
  - `403 Forbidden`: "Access denied"

#### `PUT /payment`

Marks a booking as successfully paid.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Request Body:**
  ```json
  { "bookingId": "65b2..." }
  ```
- **Responses:**
  - `200 OK`: `{ success: true, booking: { ... } }`

#### `DELETE /delete`

Deletes a booking entirely.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication & Customer/Owner/Admin)
- **Request Body:**
  ```json
  { "bookingId": "65b2..." }
  ```
- **Responses:**
  - `200 OK`: "Booking deleted successfully"
  - `403 Forbidden`: "Access denied"

---

### 4. Review Routes (`/api/review`)

#### `POST /create/:listingId`

Creates a review/rating for a specific listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Parameters:** `listingId` (Listing ObjectId)
- **Request Body:**
  ```json
  {
    "comment": "Great place!",
    "rating": 5
  }
  ```
- **Responses:**
  - `201 Created`: `{ success: true, message: "Review created successfully", review: { ... } }`
  - `400 Bad Request`: "All fields are required"

#### `GET /:listingId`

Gets all populated reviews for a specific listing.

- **Parameters:** `listingId` (Listing ObjectId)
- **Responses:**
  - `200 OK`: `{ success: true, data: [ReviewObjects] }`

#### `DELETE /delete/:listingId`

Deletes a specific review from a listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Parameters:** `listingId` (Listing ObjectId)
- **Request Body:**
  ```json
  { "reviewId": "65bd..." }
  ```
- **Responses:**
  - `200 OK`: "Review deleted successfully"

---

### 5. Like Routes (`/api/like`)

#### `POST /`

Toggles a 'like' on a specific listing for a user.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Request Body:**
  ```json
  {
    "listingId": "65a1...",
    "userId": "65b9..."
  }
  ```
- **Responses:**
  - `201 Created`: "Like added successfully" / `liked: true`
  - `200 OK`: "Like removed successfully" / `liked: false`

#### `GET /check`

Checks if a user has currently liked a specific listing.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Query Parameters:** `listingId`, `userId`
- **Responses:**
  - `200 OK`: `{ liked: true }` // or false

#### `GET /user`

Gets all listings liked by a specific user.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Query Parameters:** `userId`
- **Responses:**
  - `200 OK`: Returns array of fully-populated liked listings.

---

### 6. Payment Routes (`/api/payment`)

#### `POST /create-checkout-session`

Initiates a Stripe checkout session for a booking.

- **Headers:** `Cookie: token=<jwt_token>` (Requires Authentication)
- **Request Body:**
  ```json
  {
    "listing": {
      "id": "...",
      "title": "Beachhouse",
      "price": 100,
      "images": ["url"]
    },
    "bookingId": "65c3...",
    "stayDay": 3
  }
  ```
- **Responses:**
  - `200 OK`: `{ "url": "https://checkout.stripe.com/c/pay/..." }`
  - `500 Internal Server Error`: Payment API exception
