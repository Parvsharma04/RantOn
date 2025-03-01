import express from "express";
const app = express();

app.get("/", (req, res): void => {
  res.send("server is running");
});

app.listen(8000, () => {
  console.log("listening on 8000");
});
