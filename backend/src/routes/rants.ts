import express from "express";
import {
  createRant,
  deleteRant,
  getAllRants,
  getRant,
} from "../controllers/rants";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getAllRants);
router.get("/:id", getRant);
router.post("/", authenticateUser, createRant);
router.delete("/:id", authenticateUser, deleteRant);

export default router;
