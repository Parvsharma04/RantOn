import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import comments from "./routes/comments";
import likes from "./routes/likes";
import rants from "./routes/rants";
import users from "./routes/users";
const app = express();

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use("/api/users", users);
app.use("/api/rants", rants);
app.use("/api/likes", likes);
app.use("/api/comments", comments);
app.get("/", (req, res): void => {
  res.send("server is running");
});
//@tsignore
app._router.stack.forEach((r: { route: { path: any } }) => {
  if (r.route && r.route.path) {
    console.log(`Route loaded: ${r.route.path}`);
  }
});

app.listen(8000, () => {
  console.log("listening on 8000");
});
