import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    inwardNo: { type: String, required: true, unique: true },
    itemCode: { type: String, required: true },
    poNo: String,
    indentNo: { type: String, default: "" },
    quantity: { type: Number, required: true },
    balanceQty: { type: Number, required: true },
    inwardDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);
export default mongoose.model("Inward", schema);
