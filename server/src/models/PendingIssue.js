import mongoose from "mongoose";

const pendingIssueSchema = new mongoose.Schema(
  {
    issueNo: { type: String, required: true, unique: true },
    outwardNo: { type: String, default: "", uppercase: true },
    section: { type: String, required: true },
    itemCode: { type: String, default: "", uppercase: true },
    itemName: { type: String, default: "" },
    colour: { type: String, required: true, uppercase: true },
    size: { type: String, default: "", uppercase: true },
    requiredPcs: { type: Number, default: 0, min: 0 },
    requiredMtr: { type: Number, default: 0, min: 0 },
    availableMtr: { type: Number, default: 0, min: 0 },
    shortageMtr: { type: Number, default: 0, min: 0 },
    issueType: {
      type: String,
      enum: ["Material Shortage", "Elastic Rejected", "Production Hold", "Rework Pending", "Sewing Hold", "Other"],
      default: "Material Shortage",
    },
    reason: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    neededDate: Date,
    status: {
      type: String,
      enum: ["Pending", "Material Requested", "Store Checking", "PO Raised", "In Transit", "Material Received", "Resolved", "Cancelled"],
      default: "Pending",
    },
    remarks: { type: String, default: "" },
    createdBy: { type: String, default: "Production User" },
    resolvedAt: Date,
  },
  { timestamps: true },
);

export default mongoose.model("PendingIssue", pendingIssueSchema);
