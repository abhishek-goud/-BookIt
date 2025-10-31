import mongoose, { Schema, model, models } from "mongoose";

export type ExperienceTime = {
  time: string;
  capacity: number; // duplicate of label for easy frontend binding
  // capacity: string; // max total quantity allowed for this time slot per date
};

export interface ExperienceDocument extends mongoose.Document {
  title: string;
  location: string;
  description: string;
  image: string;
  price: string;
  times: ExperienceTime[];
  dates: string[];
  // dates: { label: string; value: string }[];
}

const ExperienceSchema = new Schema<ExperienceDocument>({
  title: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  // dates: [
  //   new Schema<{ label: string; value: string }>(
  //     {
  // label: { type: String, required: true },
  // value: { type: String, required: true },
  //     },
  //     { _id: false }
  //   ),
  // ],
  times: [
    new Schema<ExperienceTime>(
      {
        // time_label: { type: String, required: true },
        time: { type: String, required: true },
        // capacity: { type: String, required: true, min: 0 },
        capacity: { type: Number, required: true, min: 0 },
        // value: { type: String, required: true },
      },
      { _id: false }
    ),
  ],
  dates: {
    type: [String],
    required: true,
  },
});

export const Experience =
  models.Experience ||
  model<ExperienceDocument>("Experience", ExperienceSchema);
