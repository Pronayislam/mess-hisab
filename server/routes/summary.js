import express from "express";
import Bazar from "../models/Bazar.js";
import Joma from "../models/Joma.js";
import Meal from "../models/Meal.js";

const router = express.Router();

// GET /api/summary?month=2026-11
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month is required (YYYY-MM)" });
    }
    const filter = { date: { $regex: `^${month}` } };

    const [bazarList, jomaList, mealList] = await Promise.all([
      Bazar.find(filter),
      Joma.find(filter),
      Meal.find(filter),
    ]);

    const totalBazar = bazarList.reduce((s, b) => s + b.amt, 0);

    const members = {};
    const get = (name) =>
      (members[name] ??= { member: name, meals: 0, joma: 0 });

    mealList.forEach((m) => (get(m.member).meals += m.dupur + m.rat));
    jomaList.forEach((j) => (get(j.member).joma += j.amount));

    const totalMeals = Object.values(members).reduce((s, m) => s + m.meals, 0);
    const mealRate = totalMeals ? totalBazar / totalMeals : 0;

    const rows = Object.values(members).map((m) => {
      const cost = m.meals * mealRate;
      return {
        ...m,
        cost: Math.round(cost * 100) / 100,
        balance: Math.round((m.joma - cost) * 100) / 100,
      };
    });

    res.json({
      month,
      totalBazar,
      totalMeals,
      mealRate: Math.round(mealRate * 100) / 100,
      members: rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET /api/summary/daily?month=2026-11
router.get("/daily", async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ message: "month is required (YYYY-MM)" });
    }
    const meals = await Meal.find({ date: { $regex: `^${month}` } }).sort({ date: 1 });

    const days = {};
    meals.forEach((m) => {
      const d = (days[m.date] ??= { date: m.date, dupur: 0, rat: 0, total: 0, members: [] });
      d.dupur += m.dupur;
      d.rat += m.rat;
      d.total += m.dupur + m.rat;
      if (m.dupur + m.rat > 0) {
        d.members.push({ member: m.member, dupur: m.dupur, rat: m.rat });
      }
    });

    res.json(Object.values(days));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;