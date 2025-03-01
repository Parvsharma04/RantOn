import express from "express";
import { likeRant, unlikeRant } from "../controllers/likes";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/rants/:id/like", authenticateUser, likeRant);
router.delete("/rants/:id/like", authenticateUser, unlikeRant);

export default router;
