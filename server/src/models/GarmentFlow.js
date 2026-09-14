import mongoose from "mongoose";

const normalize = (value) => String(value || "").trim().toUpperCase();

const sizeOrderSchema = new mongoose.Schema({
  size: { type: String, required: true, uppercase: true, trim: true },
  orderPcs: { type: Number, required: true, min: 1 },
  cuttingWeightPerPieceKg: { type: Number, required: true, min: 0 },
}, { _id: false });

const requirementSizeSchema = new mongoose.Schema({
  size: { type: String, required: true, uppercase: true, trim: true },
  plannedPcs: { type: Number, required: true, min: 0 },
  cuttingWeightPerPieceKg: { type: Number, required: true, min: 0 },
  requiredWeightKg: { type: Number, required: true, min: 0 },
}, { _id: false });

const colourRequirementSchema = new mongoose.Schema({
  colour: { type: String, required: true, uppercase: true, trim: true },
  sizes: { type: [requirementSizeSchema], default: [] },
  totalPcs: { type: Number, default: 0 },
  totalRequiredWeightKg: { type: Number, default: 0 },
}, { _id: false });

const garmentPlanSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  factoryId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  planNo: { type: String, required: true, uppercase: true, trim: true },
  dcNo: { type: String, default: "", uppercase: true, trim: true },
  itemName: { type: String, required: true, trim: true },
  style: { type: String, required: true, uppercase: true, trim: true },
  fabricGroup: { type: String, required: true, uppercase: true, trim: true },
  sizes: { type: [sizeOrderSchema], default: [] },
  colours: { type: [String], default: [], set: (values) => [...new Set((values || []).map(normalize).filter(Boolean))] },
  requirements: { type: [colourRequirementSchema], default: [] },
  totalOrderPcs: { type: Number, required: true, min: 1 },
  grandRequiredWeightKg: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["DRAFT", "APPROVED", "ISSUED", "CUTTING", "COMPLETED", "CANCELLED"], default: "DRAFT" },
  createdBy: { type: String, default: "" },
  approvedBy: { type: String, default: "" },
  approvedAt: Date,
}, { timestamps: true });

garmentPlanSchema.index({ companyId: 1, factoryId: 1, planNo: 1 }, { unique: true });
garmentPlanSchema.index({ companyId: 1, dcNo: 1 });

const cuttingSizeActualSchema = new mongoose.Schema({
  size: { type: String, required: true, uppercase: true, trim: true },
  plannedPcs: { type: Number, required: true, min: 0 },
  actualPcs: { type: Number, required: true, min: 0 },
  bundleCount: { type: Number, default: 0, min: 0 },
  bundleWeightKg: { type: Number, required: true, min: 0 },
}, { _id: false });

const cuttingColourActualSchema = new mongoose.Schema({
  colour: { type: String, required: true, uppercase: true, trim: true },
  issuedWeightKg: { type: Number, required: true, min: 0 },
  sizes: { type: [cuttingSizeActualSchema], default: [] },
  totalActualPcs: { type: Number, default: 0 },
  totalBundleWeightKg: { type: Number, default: 0 },
  wasteWeightKg: { type: Number, default: 0 },
}, { _id: false });

const cuttingActualSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  factoryId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: "GarmentPlan", required: true },
  planNo: { type: String, required: true, uppercase: true, trim: true },
  dcNo: { type: String, default: "", uppercase: true, trim: true },
  itemName: { type: String, required: true },
  style: { type: String, required: true },
  colours: { type: [cuttingColourActualSchema], default: [] },
  totalIssuedWeightKg: { type: Number, default: 0 },
  totalBundleWeightKg: { type: Number, default: 0 },
  totalWasteWeightKg: { type: Number, default: 0 },
  totalActualPcs: { type: Number, default: 0 },
  status: { type: String, enum: ["DRAFT", "SUBMITTED", "APPROVED"], default: "SUBMITTED" },
  enteredBy: { type: String, default: "" },
}, { timestamps: true });

cuttingActualSchema.index({ companyId: 1, factoryId: 1, planNo: 1 }, { unique: true });

const wasteRegisterSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },
  factoryId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  planNo: { type: String, required: true, uppercase: true },
  dcNo: { type: String, default: "", uppercase: true },
  itemName: String,
  style: String,
  colour: { type: String, required: true, uppercase: true },
  issuedWeightKg: { type: Number, required: true, min: 0 },
  bundleWeightKg: { type: Number, required: true, min: 0 },
  wasteWeightKg: { type: Number, required: true, min: 0 },
  recordedBy: String,
}, { timestamps: true });

wasteRegisterSchema.index({ companyId: 1, factoryId: 1, planNo: 1, colour: 1 }, { unique: true });

export const GarmentPlan = mongoose.models.GarmentPlan || mongoose.model("GarmentPlan", garmentPlanSchema);
export const CuttingActual = mongoose.models.CuttingActual || mongoose.model("CuttingActual", cuttingActualSchema);
export const FabricWasteRegister = mongoose.models.FabricWasteRegister || mongoose.model("FabricWasteRegister", wasteRegisterSchema);
