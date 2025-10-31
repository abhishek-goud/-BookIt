import mongoose, { Schema, model, models } from "mongoose";

export interface BookingDocument extends mongoose.Document {
  experienceId: mongoose.Types.ObjectId;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // e.g., "09:00 am"
  qty: number;
  total: number;
  refTxn: string; // idempotency key from frontend
  createdAt: Date;
  email: string;
  name: string;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    experienceId: {
      type: Schema.Types.ObjectId,
      ref: "Experience",
      required: true,
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
    refTxn: { type: String, required: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      minlength: 1,
      maxlength: 250,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 250,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Optional protective index to prevent exact duplicate slot bookings
// when capacity is effectively 1 per slot. We will still enforce capacity via code.
BookingSchema.index({ experienceId: 1, date: 1, time: 1 });

export const Booking =
  models.Booking || model<BookingDocument>("Booking", BookingSchema);
