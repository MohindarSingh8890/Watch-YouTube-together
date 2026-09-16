const express = require("express");
const cors = require("cors");
const roomsRouter = require("./routes/rooms");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/rooms", roomsRouter);

module.exports = app;