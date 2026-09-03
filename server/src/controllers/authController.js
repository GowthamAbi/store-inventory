import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

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

  if (await User.exists({ email: email.toLowerCase() })) {
    throw new ApiError(409, "Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
  });

  response.status(201).json(createAuthResponse(user));
}

export async function login(request, response) {
  const user = await User.findOne({ email: request.body.email?.toLowerCase() });
  const validPassword =
    user && (await bcrypt.compare(request.body.password || "", user.password));

  if (!validPassword) throw new ApiError(401, "Incorrect email or password");
  response.json(createAuthResponse(user));
}
