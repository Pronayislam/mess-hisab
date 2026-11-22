import express from "express";
import Meal from "../models/Meal.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = req.query.month
      ? { date: { $regex: `^${req.query.month}` } }
      : {};
    const meals = await Meal.find(filter).sort({ date: 1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { member, date, dupur = 0, rat = 0 } = req.body;
    const meal = await Meal.findOneAndUpdate(
      { member, date },
      { dupur, rat },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(meal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
