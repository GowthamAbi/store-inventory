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
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null, index: true },
    factoryId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    department: {
      type: String,
      enum: ["SAAS", "COMPANY", "FABRIC", "CUTTING", "ELASTIC", "ACCESSORIES", "PRODUCTION", "WAREHOUSE", "SEWING", "MANAGEMENT"],
      default: "ACCESSORIES",
    },
    reportingTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: {
      type: String,
      enum: [
        "saas_super_admin", "company_admin", "admin",
        "fabric_admin", "fabric_entry", "cutting_admin", "cutting_entry",
        "elastic_admin", "elastic_entry", "accessories_admin", "accessories_entry",
        "store", "production_planner", "production_operator", "production",
        "supervisor", "quality", "maintenance", "sewing_coordinator",
        "management", "view_only",
      ],
      default: "store",
    },
    permissions: [{ type: String }],
    active: { type: Boolean, default: true },
    resetPasswordToken: { type: String, default: "" },
    resetPasswordExpires: Date,
  },
  { timestamps: true },
);

userSchema.index({ companyId: 1, department: 1, role: 1 });
export default mongoose.model("User", userSchema);
