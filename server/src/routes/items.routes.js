import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItemByCode,
  getItems,
  updateItem,
} from "../controllers/itemController.js";
import { validateItem } from "../validators/itemValidator.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getItems));
router.get("/:itemCode", asyncHandler(getItemByCode));
router.post("/", validateItem, asyncHandler(createItem));
router.put("/:itemId", validateItem, asyncHandler(updateItem));
router.delete("/:itemId", asyncHandler(deleteItem));

export default router;
