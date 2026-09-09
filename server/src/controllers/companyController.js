import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export async function getCompanies(_request, response) {
  const companies = await Company.find().sort({ companyName: 1 }).lean();
  const rows = await Promise.all(companies.map(async (company) => ({
    ...company,
    userCount: await User.countDocuments({ companyId: company._id }),
    activeUsers: await User.countDocuments({ companyId: company._id, active: true }),
  })));
  response.json(rows);
}

export async function getCompanyWorkspace(request, response) {
  const company = await Company.findById(request.params.id).lean();
  if (!company) throw new ApiError(404, "Company not found");
  const users = await User.find({ companyId: company._id })
    .select("name email role permissions active factoryId createdAt")
    .sort({ role: 1, name: 1 })
    .lean();
  const departments = {
    Administration: users.filter((user) => ["company_admin", "admin", "management", "view_only"].includes(user.role)),
    Store: users.filter((user) => user.role === "store"),
    Production: users.filter((user) => ["production", "production_planner", "production_operator", "supervisor", "quality", "maintenance"].includes(user.role)),
    "Swing / Delivery": users.filter((user) => user.role === "sewing_coordinator"),
  };
  response.json({ company, departments, users });
}

export async function updateCompanyUser(request, response) {
  const allowedRoles = ["company_admin", "admin", "store", "production", "production_planner", "production_operator", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"];
  if (request.body.role && !allowedRoles.includes(request.body.role)) throw new ApiError(400, "Invalid company role");
  const user = await User.findOneAndUpdate(
    { _id: request.params.userId, companyId: request.params.id },
    { ...(request.body.role && { role: request.body.role }), ...(typeof request.body.active === "boolean" && { active: request.body.active }), ...(request.body.permissions && { permissions: request.body.permissions }) },
    { new: true, runValidators: true },
  ).select("name email role permissions active factoryId createdAt");
  if (!user) throw new ApiError(404, "Company user not found");
  response.json(user);
}

export async function createCompany(request, response) {
  const { companyName, factoryName, address, subscriptionPlan, adminName, adminEmail, adminPassword } = request.body;
  if (!companyName || !factoryName || !adminName || !adminEmail || !adminPassword) {
    throw new ApiError(400, "Company, factory and administrator details are required");
  }
  if (await User.exists({ email: adminEmail.toLowerCase() })) throw new ApiError(409, "Email already registered");
  const company = await Company.create({
    companyName,
    address,
    subscriptionPlan,
    subscriptionStartsAt: new Date(),
    subscriptionEndsAt: new Date(Date.now() + 14 * 86400000),
    factories: [{ name: factoryName, code: request.body.factoryCode || "MAIN", address }],
  });
  const factoryId = company.factories[0]._id;
  const user = await User.create({
    name: adminName,
    email: adminEmail,
    password: await bcrypt.hash(adminPassword, 12),
    role: "company_admin",
    companyId: company._id,
    factoryId,
  });
  response.status(201).json({ company, admin: { _id: user._id, name: user.name, email: user.email } });
}

export async function updateCompany(request, response) {
  const company = await Company.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!company) throw new ApiError(404, "Company not found");
  response.json(company);
}
