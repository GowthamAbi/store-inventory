import { Router } from "express";
import { getReports, getTraceability } from "../controllers/reportController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
router.get("/", asyncHandler(getReports));
router.get("/trace/:value", asyncHandler(getTraceability));
export default router;
