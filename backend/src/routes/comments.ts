import express from "express";
import {
  addComment,
  deleteComment,
  getRantComments,
} from "../controllers/comments";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", (req, res) => {
  console.log("Rants route hit!");
  res.send("Rants route is working!");
});

router.get("/rants/:id/comments", getRantComments);
router.post("/rants/:id/comments", authenticateUser, addComment);
router.delete("/:id", authenticateUser, deleteComment);

export default router;
