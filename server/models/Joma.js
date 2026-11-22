import mongoose from "mongoose";

const jomaSchema = new mongoose.Schema(
  {
    member: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: String, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Joma", jomaSchema);
