import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export async function getCompanies(_request, response) {
  response.json(await Company.find().sort({ companyName: 1 }));
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
