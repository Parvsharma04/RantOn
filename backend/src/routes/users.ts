import express from "express";
import {
  createUser,
  getUser,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/users";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/:id", getUser);
router.post("/", createUser);
router.patch("/:id", authenticateUser, updateUser);

export default router;
