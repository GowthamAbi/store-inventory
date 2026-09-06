import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "store", "production"],
      default: "store",
    },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
