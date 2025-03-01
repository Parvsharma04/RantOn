import { urlencoded } from "body-parser";
import cors from "cors";
import express from "express";
import comments from "./controllers/comments";
import likes from "./controllers/likes";
import rants from "./controllers/rants";
import users from "./controllers/users";

const app = express();

app.use(urlencoded({ extended: true }));
app.use(cors());

app.use("/api/users", users);
app.use("/api/rants", rants);
app.use("/api/likes", likes);
app.use("/api/comments", comments);

app.get("/", (req, res): void => {
  res.send("server is running");
});

app.listen(8000, () => {
  console.log("listening on 8000");
});
