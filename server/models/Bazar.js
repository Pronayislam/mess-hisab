import mongoose from "mongoose";

const bazarSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    by: { type: String, required: true },
    amt: { type: Number, required: true, min: 1 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Bazar", bazarSchema);