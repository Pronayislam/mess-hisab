import express from "express";
import Joma from "../models/Joma.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = req.query.month
      ? { date: { $regex: `^${req.query.month}` } }
      : {};
    const list = await Joma.find(filter).sort({ date: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const joma = await Joma.create(req.body);
    res.status(201).json(joma);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Joma.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
