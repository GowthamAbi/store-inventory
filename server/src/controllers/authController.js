import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import crypto from "node:crypto";

function createToken(user) {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function createAuthResponse(user) {
  return {
    token: createToken(user),
    user: { name: user.name, email: user.email, role: user.role },
  };
}

export async function register(request, response) {
  const { name, email, password } = request.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const userCount = await User.countDocuments();
  if (userCount > 0) {
    throw new ApiError(403, "Company setup is complete. Ask the admin to create your account");
  }
  if (await User.exists({ email: email.toLowerCase() })) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: "admin",
  });

  response.status(201).json(createAuthResponse(user));
}

export async function getUsers(_request, response) {
  response.json(await User.find().select("name email role createdAt").sort({ createdAt: 1 }));
}

export async function createUser(request, response) {
  const { name, email, password, role } = request.body;
  if (!name || !email || !password || !["store", "production"].includes(role)) {
    throw new ApiError(400, "Name, email, password and Store/Production role are required");
  }
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, "Email already registered");
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role });
  response.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
}

export async function forgotPassword(request, response) {
  const email = request.body.email?.trim().toLowerCase();
  if (!email) throw new ApiError(400, "Email is required");

  const user = await User.findOne({ email });
  if (!user) {
    return response.json({ message: "If the email exists, a reset link has been created" });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].replace(/\/$/, "");
  const resetUrl = `${clientUrl}/?resetToken=${rawToken}`;

  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [user.email],
        subject: "Accessories Flow password reset",
        html: `<p>Use this link within 30 minutes:</p><p><a href="${resetUrl}">Reset password</a></p>`,
      }),
    });
  }

  response.json({
    message: "Password reset link created. Check your email.",
    ...(process.env.NODE_ENV !== "production" && { resetUrl }),
  });
}

export async function resetPassword(request, response) {
  const { token, password } = request.body;
  if (!token || !password || password.length < 6) {
    throw new ApiError(400, "Valid token and minimum 6 character password are required");
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });
  if (!user) throw new ApiError(400, "Reset link is invalid or expired");
  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = "";
  user.resetPasswordExpires = undefined;
  await user.save();
  response.json({ message: "Password reset successfully" });
}

export async function login(request, response) {
  const user = await User.findOne({ email: request.body.email?.toLowerCase() });
  const validPassword =
    user && (await bcrypt.compare(request.body.password || "", user.password));

  if (!validPassword) throw new ApiError(401, "Incorrect email or password");
  response.json(createAuthResponse(user));
}
