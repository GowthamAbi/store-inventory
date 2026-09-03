import { Router } from "express";
import {
  getTransactions,
  saveInward,
  saveOutward,
} from "../controllers/transactionController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getTransactions));
router.post("/inward", asyncHandler(saveInward));
router.post("/outward", asyncHandler(saveOutward));

export default router;
