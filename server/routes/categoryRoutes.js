import express from "express";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "../controllers/categoryController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", getCategories);

router.post("/", authMiddleware, roleMiddleware("admin"), createCategory);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteCategory);

export default router;
