import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    member: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    dupur: { type: Number, default: 0, min: 0, max: 3 },
    rat: { type: Number, default: 0, min: 0, max: 3 },
  },
  { timestamps: true }
);

mealSchema.index({ member: 1, date: 1 }, { unique: true });

export default mongoose.model("Meal", mealSchema);
