import express from "express";
import {
  createRant,
  deleteRant,
  getAllRants,
  getRant,
} from "../controllers/rants";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", (req, res) => {
  console.log("Rants route hit!");
  res.send("Rants route is working!");
});

router.get("/", getAllRants);
router.get("/:id", getRant);
router.post("/", authenticateUser, createRant);
router.delete("/:id", authenticateUser, deleteRant);

export default router;
