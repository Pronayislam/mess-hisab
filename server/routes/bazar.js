import { Router } from "express";
import Bazar from "../models/Bazar.js";

const router = Router();

// GET /api/bazar?month=2026-11
router.get("/", async (req, res) => {
  try {
    const { month } = req.query;
    let filter = {};
    if (month) {
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ error: "month format: YYYY-MM" });
      }
      filter = { date: { $regex: `^${month}` } };
    }
    const list = await Bazar.find(filter).sort({ date: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/bazar
router.post("/", async (req, res) => {
  try {
    const { date, by, amt, note } = req.body;
    const item = await Bazar.create({ date, by, amt, note });
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/bazar/:id
router.delete("/:id", async (req, res) => {
  try {
    const item = await Bazar.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;