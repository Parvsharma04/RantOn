import express from "express";
import { likeRant, unlikeRant } from "../controllers/likes";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", (req, res) => {
  console.log("Rants route hit!");
  res.send("Rants route is working!");
});

router.post("/rants/:id/like", authenticateUser, likeRant);
router.delete("/rants/:id/like", authenticateUser, unlikeRant);

export default router;
