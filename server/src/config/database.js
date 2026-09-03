import mongoose from "mongoose";

/** Connect the application to MongoDB Atlas. */
export async function connectDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected successfully");
}
