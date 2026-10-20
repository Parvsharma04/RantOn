import express from "express";
import {
  auth,
  checkUsername,
  getDashboard,
  getUser,
  updateUsername,
} from "../controllers/users";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = express.Router();

// router.post("/login", loginUser);
// router.post("/register", registerUser);
router.get("/", (req, res) => {
  res.send("router working");
});
router.post("/auth", auth);
router.get("/username-availability", checkUsername);
router.put("/username", authenticateUser, updateUsername);
router.get("/dashboard", authenticateUser, getDashboard);
router.get("/:id", getUser);

export default router;
