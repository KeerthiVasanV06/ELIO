import express from "express";
import {
	getProfile,
	getUsers,
	getUserById,
	updateProfile,
	changePassword,
	updateUserRole,
	deleteUser,
	getUserStats,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);

router.get("/stats/:userId", getUserStats);

router.get("/:id", authMiddleware, roleMiddleware("admin"), getUserById);

router.get("/", authMiddleware, roleMiddleware("admin"), getUsers);

router.put("/profile", authMiddleware, updateProfile);

router.put("/profile/password", authMiddleware, changePassword);

router.put(
	"/:id/role",
	authMiddleware,
	roleMiddleware("admin"),
	updateUserRole
);

router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteUser);

export default router;

