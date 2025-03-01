import express from "express";
import {
  addComment,
  deleteComment,
  getRantComments,
} from "../controllers/comments";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/rants/:id/comments", getRantComments);
router.post("/rants/:id/comments", authenticateUser, addComment);
router.delete("/:id", authenticateUser, deleteComment);

export default router;
