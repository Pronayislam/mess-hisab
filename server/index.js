import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bazarRoutes from "./routes/bazar.js";
import jomaRoutes from "./routes/joma.js";
import mealRoutes from "./routes/meal.js";
import summaryRoutes from "./routes/summary.js";
import { auth, writeGuard } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bazar", auth, writeGuard, bazarRoutes);
app.use("/api/joma", auth, writeGuard, jomaRoutes);
app.use("/api/meals", auth, writeGuard, mealRoutes);
app.use("/api/summary", auth, summaryRoutes);
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