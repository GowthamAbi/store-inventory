import Employee from "../models/Employee.js";
import Machine from "../models/Machine.js";
import Outward from "../models/Outward.js";
import PendingIssue from "../models/PendingIssue.js";
import ProductionJob from "../models/ProductionJob.js";
import SewingDelivery from "../models/SewingDelivery.js";
import ApiError from "../utils/ApiError.js";
import { generateReferenceNo } from "../utils/generateReferenceNo.js";

const normalize = (value) => String(value || "").trim().toUpperCase();

export async function getProductionSummary(_request, response) {
  const [machines, jobs, pendingIssues, sewingDeliveries] = await Promise.all([
    Machine.find().sort({ machineCode: 1 }).lean(),
    ProductionJob.find().sort({ createdAt: -1 }).limit(100).lean(),
    PendingIssue.find({ status: { $nin: ["Resolved", "Cancelled"] } }).sort({ priority: 1, createdAt: -1 }).lean(),
    SewingDelivery.find().sort({ deliveryDate: -1 }).limit(50).lean(),
  ]);
  response.json({
    machines,
    jobs,
    pendingIssues,
    sewingDeliveries,
    counts: {
      running: machines.filter((entry) => entry.status === "Running").length,
      available: machines.filter((entry) => entry.status === "Available").length,
      breakdown: machines.filter((entry) => entry.status === "Breakdown").length,
      pending: pendingIssues.length,
      todayOkPcs: jobs.filter((entry) => new Date(entry.updatedAt).toDateString() === new Date().toDateString()).reduce((sum, entry) => sum + entry.okPcs, 0),
    },
  });
}

export async function getMachines(_request, response) {
  response.json(await Machine.find().sort({ machineCode: 1 }));
}

export async function saveMachine(request, response) {
  const data = { ...request.body, machineCode: normalize(request.body.machineCode) };
  const machine = request.params.id
    ? await Machine.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true })
    : await Machine.create(data);
  if (!machine) throw new ApiError(404, "Machine not found");
  response.status(request.params.id ? 200 : 201).json(machine);
}

export async function getEmployees(_request, response) {
  response.json(await Employee.find().sort({ employeeCode: 1 }));
}

export async function saveEmployee(request, response) {
  const data = { ...request.body, employeeCode: normalize(request.body.employeeCode) };
  const employee = request.params.id
    ? await Employee.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true })
    : await Employee.create(data);
  if (!employee) throw new ApiError(404, "Employee not found");
  response.status(request.params.id ? 200 : 201).json(employee);
}

export async function getJobs(_request, response) {
  response.json(await ProductionJob.find().sort({ createdAt: -1 }));
}

export async function startJob(request, response) {
  const outwardNo = normalize(request.body.outwardNo);
  const machineCode = normalize(request.body.machineCode);
  const employeeCode = normalize(request.body.employeeCode);
  const [outward, machine, employee] = await Promise.all([
    Outward.findOne({ outwardNo }),
    Machine.findOne({ machineCode, active: true }),
    Employee.findOne({ employeeCode, active: true }),
  ]);
  if (!outward) throw new ApiError(404, "Main Outward QR / number not found");
  if (!machine) throw new ApiError(404, "Machine QR / code not found");
  if (!employee) throw new ApiError(404, "Employee QR / code not found");
  if (machine.status !== "Available") throw new ApiError(409, `Machine is ${machine.status}`);

  const plannedPcs = Number(request.body.plannedPcs);
  if (!Number.isFinite(plannedPcs) || plannedPcs <= 0) throw new ApiError(400, "Valid planned pieces are required");

  const job = await ProductionJob.create({
    jobNo: generateReferenceNo("PRD"),
    outwardNo,
    itemCode: outward.itemCode,
    itemName: outward.itemName,
    section: request.body.section || outward.section || "Elastic Production",
    colour: normalize(request.body.colour),
    size: normalize(request.body.size),
    plannedPcs,
    balancePcs: plannedPcs,
    machineCode,
    employeeCode,
    createdBy: request.user?.name || "Production User",
  });
  machine.status = "Running";
  await machine.save();
  response.status(201).json(job);
}

export async function stopJob(request, response) {
  const job = await ProductionJob.findById(request.params.id);
  if (!job) throw new ApiError(404, "Production job not found");
  const machine = await Machine.findOne({ machineCode: job.machineCode });
  const action = request.body.action;
  const allowed = ["Complete", "Breakdown", "Thread Change", "Box Change", "Size Change", "Other Change"];
  if (!allowed.includes(action)) throw new ApiError(400, "Select a valid stop action");

  if (action === "Complete") {
    const ok = Number(request.body.okPcs || 0);
    const rework = Number(request.body.reworkPcs || 0);
    const rejection = Number(request.body.rejectionPcs || 0);
    if (ok + rework + rejection > job.balancePcs) throw new ApiError(400, "Output exceeds production balance");
    job.okPcs += ok;
    job.reworkPcs += rework;
    job.rejectionPcs += rejection;
    job.balancePcs = Math.max(0, job.plannedPcs - job.okPcs - job.reworkPcs - job.rejectionPcs);
    job.status = job.balancePcs === 0 ? "Completed" : "Partially Completed";
    job.stopTime = new Date();
    if (machine) machine.status = "Available";
  } else {
    job.status = action;
    job.events.push({ type: action, reason: request.body.reason || "", startTime: new Date() });
    if (machine) machine.status = action;
  }
  await job.save();
  if (machine) await machine.save();
  response.json(job);
}

export async function resumeJob(request, response) {
  const job = await ProductionJob.findById(request.params.id);
  if (!job) throw new ApiError(404, "Production job not found");
  const activeEvent = [...job.events].reverse().find((entry) => !entry.stopTime);
  if (activeEvent) activeEvent.stopTime = new Date();
  job.status = "Running";
  await job.save();
  await Machine.findOneAndUpdate({ machineCode: job.machineCode }, { status: "Running" });
  response.json(job);
}

export async function getPendingIssues(_request, response) {
  response.json(await PendingIssue.find().sort({ createdAt: -1 }));
}

export async function savePendingIssue(request, response) {
  const shortageMtr = Math.max(0, Number(request.body.requiredMtr || 0) - Number(request.body.availableMtr || 0));
  const data = { ...request.body, shortageMtr, createdBy: request.user?.name || "Production User" };
  const issue = request.params.id
    ? await PendingIssue.findByIdAndUpdate(request.params.id, data, { new: true, runValidators: true })
    : await PendingIssue.create({ ...data, issueNo: generateReferenceNo("PND") });
  if (!issue) throw new ApiError(404, "Pending issue not found");
  response.status(request.params.id ? 200 : 201).json(issue);
}

export async function changeIssueStatus(request, response) {
  const status = request.body.status;
  const issue = await PendingIssue.findByIdAndUpdate(
    request.params.id,
    { status, ...(status === "Resolved" && { resolvedAt: new Date() }) },
    { new: true, runValidators: true },
  );
  if (!issue) throw new ApiError(404, "Pending issue not found");
  response.json(issue);
}

export async function getSewingDeliveries(_request, response) {
  response.json(await SewingDelivery.find().sort({ deliveryDate: -1 }));
}

export async function createSewingDelivery(request, response) {
  const jobs = await ProductionJob.find({
    outwardNo: normalize(request.body.outwardNo),
    colour: normalize(request.body.colour),
    size: normalize(request.body.size),
  });
  const produced = jobs.reduce((sum, entry) => sum + entry.okPcs, 0);
  const delivered = await SewingDelivery.aggregate([
    { $match: { outwardNo: normalize(request.body.outwardNo), colour: normalize(request.body.colour), size: normalize(request.body.size) } },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ]);
  const available = produced - (delivered[0]?.total || 0);
  const quantity = Number(request.body.quantity);
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > available) {
    throw new ApiError(400, `Only ${Math.max(0, available)} OK pcs available for sewing`);
  }
  const delivery = await SewingDelivery.create({
    ...request.body,
    outwardNo: normalize(request.body.outwardNo),
    colour: normalize(request.body.colour),
    size: normalize(request.body.size),
    quantity,
    deliveryNo: generateReferenceNo("SEW"),
    createdBy: request.user?.name || "Production User",
  });
  response.status(201).json(delivery);
}
