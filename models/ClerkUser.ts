// models/ClerkUser.ts
import mongoose from "mongoose"

const ClerkUserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  firstName: String,
  lastName: String,
  phone: String,
  company: String,
  role: { type: String, default: "customer" },
}, { timestamps: true })


export default mongoose.models.ClerkUser || mongoose.model("ClerkUser", ClerkUserSchema)