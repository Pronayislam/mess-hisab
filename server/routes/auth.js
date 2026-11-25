import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

const publicUser = (u) => ({ id: u._id, name: u.name, username: u.username, role: u.role });

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const user = await User.findOne({ username: String(username).toLowerCase().trim() });
    const ok = user && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: "Invalid username or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "User not found" });
  res.json({ user: publicUser(user) });
});

export default router;