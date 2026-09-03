import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "http://localhost:5173",
  }),
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
