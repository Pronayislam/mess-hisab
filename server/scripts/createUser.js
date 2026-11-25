import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const [name, username, password, role = "member"] = process.argv.slice(2);

if (!name || !username || !password) {
  console.log('Usage: node scripts/createUser.js "Name" username password [admin|member]');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const hash = await bcrypt.hash(password, 10);
await User.findOneAndUpdate(
  { username: username.toLowerCase() },
  { name, username: username.toLowerCase(), password: hash, role },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);
console.log(`Saved ${role}: ${username}`);
await mongoose.disconnect();