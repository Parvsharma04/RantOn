import express from "express";
import { auth, getUser } from "../controllers/users";

const router = express.Router();

// router.post("/login", loginUser);
// router.post("/register", registerUser);
router.get("/", (req, res) => {
  res.send("router working");
});
router.post("/auth", auth);
router.get("/:id", getUser);

export default router;
