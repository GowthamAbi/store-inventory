import mongoose from "mongoose";
import PurchaseOrder from "../models/PurchaseOrder.js";
import User from "../models/User.js";

/** Connect the application to MongoDB Atlas. */
export async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Older releases created a unique PO-number-only index. Remove only that
  // legacy index so a PO can safely contain multiple item-code lines.
  const indexes = await PurchaseOrder.collection.indexes();
  const oldPoIndex = indexes.find(
    (index) => index.unique && JSON.stringify(index.key) === JSON.stringify({ poNo: 1 }),
  );
  if (oldPoIndex) await PurchaseOrder.collection.dropIndex(oldPoIndex.name);
  await PurchaseOrder.syncIndexes();

  // Upgrade an existing Store-only installation: preserve the oldest account
  // and make it the single administrator when no admin exists yet.
  if (!(await User.exists({ role: "admin" }))) {
    const oldestUser = await User.findOne().sort({ createdAt: 1 });
    if (oldestUser) {
      oldestUser.role = "admin";
      await oldestUser.save();
    }
  }
  console.log("MongoDB connected successfully");
}
