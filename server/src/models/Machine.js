import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    machineCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    machineName: { type: String, required: true, trim: true },
    section: { type: String, default: "Elastic Production" },
    capacityPerHour: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Available", "Running", "Breakdown", "Thread Change", "Box Change", "Size Change", "Other Change"],
      default: "Available",
    },
    nextPlan: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model("Machine", machineSchema);
