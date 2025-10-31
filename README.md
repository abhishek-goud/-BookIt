Highway Delite – Project Overview

## App Routing

- `/` – Home (implicit)
- `/[id]/details` – Experience details page with date/time selection and quantity
- `/checkout` – Checkout page (promo, contact, summary, payment)
- `/[id]/confirmation` – Booking confirmation page displaying Ref ID (uses `params.id`)

## API Endpoints

- `GET /api/experiences`
  - Optional query: `?location=<string>` (case-insensitive regex match)
  - Auto-seeds default experiences/times/dates if DB empty (idempotent seeding)
  - Response: array of experiences

- `GET /api/experiences/[id]`
  - Validates ObjectId and returns an experience document
  - Response: single experience with `times` [{ time, capacity }] and `dates`

- POST /api/promo/validate
  - Body: `{ code: string }`
  - Looks up promo by `promoCode` and returns `{ valid: boolean, code?: string, discount?: number }`

- `POST /api/bookings`
  - Body: `{ experienceId: string, date: string, time: string, qty: number, total: number, refTxn: string }`
  - Validations: payload; `experienceId` format; existence of experience; time slot and date; capacity check
  - Idempotency: uses `refTxn` to ensure a booking is created only once
  - Behavior:
    - If `refTxn` exists: returns existing booking (200) without decrementing capacity
    - If capacity insufficient: 409 with `{ error: "Slot sold out" }`
    - Atomic decrement: `$inc` on `times.<slotIndex>.capacity` guarded by `$gte`
    - On booking create failure: compensating increment restores capacity

## Idempotency and Double-Booking Protection

- Client generates unique `refTxn` (e.g., `TXN<timestamp><random>`) during checkout and navigates to `/<refTxn>/confirmation` upon success.
- Server checks for existing booking by `refTxn` before making any state changes:
  - If found, returns it directly (prevents duplicate decrement and duplicate booking)
  - Otherwise:
    - Validates slot capacity with numeric comparison
    - Performs atomic `$inc: { times.<index>.capacity: -qty }` only if current capacity `>= qty`
    - Creates the booking document with `refTxn`
    - If creation fails (including duplicate `refTxn` unique error), increments capacity back and returns existing booking when applicable

This combination prevents race conditions and ensures a request is processed once even if retried.

## Frontend Structure

- `app/[id]/details/page.tsx`
  - Loads experience by id (`/api/experiences/[id]?date=today`)
  - Shows `dates`, `times` with live capacities, and price
  - Client-side guard: prevents increasing quantity beyond selected time `capacity` with an alert
  - On change, updates a shared `orderSummary` context

- `app/checkout/page.tsx`
  - Collects user info, promo code, and terms consent
  - Validates name and email (regex + HTML `pattern`)
  - Applies promo via `POST /api/promo/validate` and adjusts price: `(1 - discount/100) * basePrice`
  - Computes subtotal, taxes, and total; on confirm, posts to `POST /api/bookings`
  - Navigates to `/<refTxn>/confirmation` on success
  - Includes robust date formatting via `convertToISO` (safe for undefined during prerender)

- `app/[id]/confirmation/page.tsx`
  - Reads `refId` from `params.id` and displays it as the Reference ID

- Shared Contexts
  - `context/OrderContext.tsx` – stores and shares `orderSummary` across pages

## Data Models

- `models/Experience.ts`
  - Experience with `times` [{ time: string, capacity: number }] and `dates` [string]

- `models/Booking.ts`
  - Stores `experienceId`, `date`, `time`, `qty`, `total`, `refTxn`
  - `refTxn` used for idempotency lookups (recommended to be unique indexed)

- `models/Promo.ts`
  - `promoCode` (uppercase, unique), `discount` (0-100)

## Database Schema

### Experience
```ts
import mongoose, { Schema } from "mongoose";

type ExperienceTime = {
  time: string;
  capacity: number;
};

const ExperienceSchema = new Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  times: [
    new Schema<ExperienceTime>({
      time: { type: String, required: true },
      capacity: { type: Number, required: true, min: 0 },
    }, { _id: false }),
  ],
  dates: { type: [String], required: true },
});
```

### Booking
```ts
import mongoose, { Schema } from "mongoose";

const BookingSchema = new Schema({
  experienceId: { type: Schema.Types.ObjectId, ref: "Experience", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  time: { type: String, required: true }, // e.g., "09:00 am"
  qty: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true, min: 0 },
  refTxn: { type: String, required: true, unique: true }, // idempotency key
}, { timestamps: { createdAt: true, updatedAt: false } });

// Helpful index for finding existing bookings of a slot
BookingSchema.index({ experienceId: 1, date: 1, time: 1 });
```

### Promo
```ts
import { Schema } from "mongoose";

const PromoSchema = new Schema({
  promoCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
  discount: { type: Number, required: true, min: 0, max: 100 },
});
```

## Notes

- Dynamic route segments must use a consistent parameter name; the project standardizes on `[id]` for confirmation. Ensure navigation uses `/${refTxn}/confirmation`.
- The client enforces quantity ≤ capacity for UX, while the server strictly enforces capacity and idempotency for correctness.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

