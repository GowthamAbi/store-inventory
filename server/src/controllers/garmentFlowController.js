import ApiError from "../utils/ApiError.js";
import { generateReferenceNo } from "../utils/generateReferenceNo.js";
import { GarmentPlan, CuttingActual, FabricWasteRegister } from "../models/GarmentFlow.js";

const normalize = (value) => String(value || "").trim().toUpperCase();
const round = (value, digits = 3) => Number(Number(value || 0).toFixed(digits));

function tenant(request) {
  if (!request.user?.companyId) throw new ApiError(403, "Company access is required");
  return {
    companyId: request.user.companyId,
    ...(request.user.factoryId ? { factoryId: request.user.factoryId } : {}),
  };
}

function distribute(total, count, index) {
  const base = Math.floor(total / count);
  return base + (index < total % count ? 1 : 0);
}

export async function createPlan(request, response) {
  const scope = tenant(request);
  const colours = [...new Set((request.body.colours || []).map(normalize).filter(Boolean))];
  const sizes = (request.body.sizes || []).map((row) => ({
    size: normalize(row.size),
    orderPcs: Number(row.orderPcs),
    cuttingWeightPerPieceKg: Number(row.cuttingWeightPerPieceKg),
  }));

  if (!request.body.itemName?.trim() || !normalize(request.body.style) || !normalize(request.body.fabricGroup)) {
    throw new ApiError(400, "Item name, style and fabric group are required");
  }
  if (!colours.length) throw new ApiError(400, "At least one fabric colour is required");
  if (!sizes.length || sizes.some((row) => !row.size || row.orderPcs <= 0 || row.cuttingWeightPerPieceKg <= 0)) {
    throw new ApiError(400, "Every size needs valid order PCS and approved cutting WT/PCS");
  }

  const requirements = colours.map((colour, colourIndex) => {
    const rows = sizes.map((size) => {
      const plannedPcs = distribute(size.orderPcs, colours.length, colourIndex);
      return {
        size: size.size,
        plannedPcs,
        cuttingWeightPerPieceKg: size.cuttingWeightPerPieceKg,
        requiredWeightKg: round(plannedPcs * size.cuttingWeightPerPieceKg),
      };
    });
    return {
      colour,
      sizes: rows,
      totalPcs: rows.reduce((sum, row) => sum + row.plannedPcs, 0),
      totalRequiredWeightKg: round(rows.reduce((sum, row) => sum + row.requiredWeightKg, 0)),
    };
  });

  const totalOrderPcs = sizes.reduce((sum, row) => sum + row.orderPcs, 0);
  const plan = await GarmentPlan.create({
    ...scope,
    planNo: normalize(request.body.planNo) || generateReferenceNo("GCP"),
    dcNo: normalize(request.body.dcNo),
    itemName: request.body.itemName.trim(),
    style: normalize(request.body.style),
    fabricGroup: normalize(request.body.fabricGroup),
    sizes,
    colours,
    requirements,
    totalOrderPcs,
    grandRequiredWeightKg: round(requirements.reduce((sum, row) => sum + row.totalRequiredWeightKg, 0)),
    createdBy: request.user.name || request.user.email,
  });
  response.status(201).json(plan);
}

export async function listPlans(request, response) {
  response.json(await GarmentPlan.find(tenant(request)).sort({ createdAt: -1 }).lean());
}

export async function getPlan(request, response) {
  const key = normalize(request.params.reference);
  const plan = await GarmentPlan.findOne({
    ...tenant(request),
    $or: [{ planNo: key }, { dcNo: key }],
  }).lean();
  if (!plan) throw new ApiError(404, "Plan / DC not found");
  response.json(plan);
}

export async function approvePlan(request, response) {
  const plan = await GarmentPlan.findOneAndUpdate(
    { ...tenant(request), _id: request.params.id },
    { status: "APPROVED", approvedBy: request.user.name || request.user.email, approvedAt: new Date() },
    { new: true },
  );
  if (!plan) throw new ApiError(404, "Plan not found");
  response.json(plan);
}

export async function saveCuttingActual(request, response) {
  const scope = tenant(request);
  const plan = await GarmentPlan.findOne({ ...scope, _id: request.params.planId });
  if (!plan) throw new ApiError(404, "Plan not found");

  const issuedMap = new Map((request.body.colours || []).map((row) => [normalize(row.colour), Number(row.issuedWeightKg)]));
  const actualMap = new Map((request.body.colours || []).map((row) => [normalize(row.colour), row]));

  const colours = plan.requirements.map((plannedColour) => {
    const input = actualMap.get(plannedColour.colour) || {};
    const sizeMap = new Map((input.sizes || []).map((row) => [normalize(row.size), row]));
    const sizes = plannedColour.sizes.map((planned) => {
      const actual = sizeMap.get(planned.size) || {};
      const actualPcs = Number(actual.actualPcs || 0);
      const bundleWeightKg = Number(actual.bundleWeightKg || 0);
      const bundleCount = Number(actual.bundleCount || 0);
      if ([actualPcs, bundleWeightKg, bundleCount].some((value) => !Number.isFinite(value) || value < 0)) {
        throw new ApiError(400, plannedColour.colour + " / " + planned.size + ": actual values cannot be negative");
      }
      return { size: planned.size, plannedPcs: planned.plannedPcs, actualPcs, bundleCount, bundleWeightKg };
    });
    const issuedWeightKg = issuedMap.get(plannedColour.colour);
    if (!Number.isFinite(issuedWeightKg) || issuedWeightKg < 0) {
      throw new ApiError(400, plannedColour.colour + ": issued fabric weight is required");
    }
    const totalBundleWeightKg = round(sizes.reduce((sum, row) => sum + row.bundleWeightKg, 0));
    if (totalBundleWeightKg > issuedWeightKg) throw new ApiError(400, plannedColour.colour + ": bundle weight exceeds issued weight");
    return {
      colour: plannedColour.colour,
      issuedWeightKg,
      sizes,
      totalActualPcs: sizes.reduce((sum, row) => sum + row.actualPcs, 0),
      totalBundleWeightKg,
      wasteWeightKg: round(issuedWeightKg - totalBundleWeightKg),
    };
  });

  const totals = {
    totalIssuedWeightKg: round(colours.reduce((sum, row) => sum + row.issuedWeightKg, 0)),
    totalBundleWeightKg: round(colours.reduce((sum, row) => sum + row.totalBundleWeightKg, 0)),
    totalWasteWeightKg: round(colours.reduce((sum, row) => sum + row.wasteWeightKg, 0)),
    totalActualPcs: colours.reduce((sum, row) => sum + row.totalActualPcs, 0),
  };

  const actual = await CuttingActual.findOneAndUpdate(
    { ...scope, planNo: plan.planNo },
    {
      ...scope, planId: plan._id, planNo: plan.planNo, dcNo: plan.dcNo,
      itemName: plan.itemName, style: plan.style, colours, ...totals,
      enteredBy: request.user.name || request.user.email,
    },
    { upsert: true, new: true, runValidators: true },
  );

  await Promise.all(colours.map((row) => FabricWasteRegister.findOneAndUpdate(
    { ...scope, planNo: plan.planNo, colour: row.colour },
    {
      ...scope, planNo: plan.planNo, dcNo: plan.dcNo, itemName: plan.itemName,
      style: plan.style, colour: row.colour, issuedWeightKg: row.issuedWeightKg,
      bundleWeightKg: row.totalBundleWeightKg, wasteWeightKg: row.wasteWeightKg,
      recordedBy: request.user.name || request.user.email,
    },
    { upsert: true, new: true, runValidators: true },
  )));

  plan.status = "COMPLETED";
  await plan.save();
  response.status(201).json(actual);
}

export async function getCuttingActual(request, response) {
  const key = normalize(request.params.reference);
  const actual = await CuttingActual.findOne({
    ...tenant(request),
    $or: [{ planNo: key }, { dcNo: key }],
  }).lean();
  if (!actual) throw new ApiError(404, "Completed cutting actual not found");
  response.json(actual);
}

export async function elasticRequirement(request, response) {
  const key = normalize(request.params.reference);
  const actual = await CuttingActual.findOne({
    ...tenant(request),
    $or: [{ planNo: key }, { dcNo: key }],
  }).lean();
  if (!actual) throw new ApiError(404, "Cutting actual must be submitted before elastic calculation");

  const measurements = new Map((request.body.measurements || []).map((row) => [
    normalize(row.size),
    { measurementMtr: Number(row.measurementMtr), piecesPerGarment: Number(row.piecesPerGarment || 1) },
  ]));

  const colours = actual.colours.map((colour) => ({
    colour: colour.colour,
    sizes: colour.sizes.map((row) => {
      const bom = measurements.get(row.size);
      if (!bom || bom.measurementMtr <= 0 || bom.piecesPerGarment <= 0) {
        throw new ApiError(400, row.size + ": approved Elastic BOM measurement is required");
      }
      return {
        size: row.size,
        actualCuttingPcs: row.actualPcs,
        measurementMtr: bom.measurementMtr,
        piecesPerGarment: bom.piecesPerGarment,
        wantedMtr: round(row.actualPcs * bom.piecesPerGarment * bom.measurementMtr),
      };
    }),
  }));

  response.json({
    planNo: actual.planNo,
    dcNo: actual.dcNo,
    itemName: actual.itemName,
    style: actual.style,
    colours,
    grandActualPcs: actual.totalActualPcs,
    grandWantedMtr: round(colours.flatMap((row) => row.sizes).reduce((sum, row) => sum + row.wantedMtr, 0)),
  });
}

export async function wasteRegister(request, response) {
  response.json(await FabricWasteRegister.find(tenant(request)).sort({ createdAt: -1 }).lean());
}
