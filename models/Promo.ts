import mongoose, { Schema, model, models } from "mongoose";

export interface PromoDocument extends mongoose.Document {
  promoCode: string;
  discount: number;
}

const PromoSchema = new Schema<PromoDocument>({
  promoCode: { type: String, required: true, unique: true, trim: true, uppercase: true },
  discount: {type:Number, required: true, min: 0, max:100}
});

export const Promo = models.Promo || model<PromoDocument>("Promo", PromoSchema);


