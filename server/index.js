import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bazarRoutes from "./routes/bazar.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/bazar", bazarRoutes);
app.get("/", (req, res) => res.send("Mess Hisab API is running"));
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });