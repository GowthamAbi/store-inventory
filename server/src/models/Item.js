import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    brand: { type: String, default: "" },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, default: "" },
    colour: { type: String, default: "" },
    unit: { type: String, default: "PCS" },
    minimumQty: { type: Number, default: 0 },
    stockQty: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Item", itemSchema);
