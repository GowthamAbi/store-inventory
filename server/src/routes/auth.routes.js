import { Router } from "express";
import {
  forgotPassword,
  createUser,
  getUsers,
  login,
  register,
  resetPassword,
} from "../controllers/authController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.get("/users", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin"), asyncHandler(getUsers));
router.post("/users", requireAuth, allowRoles("saas_super_admin", "company_admin", "admin"), asyncHandler(createUser));

export default router;
