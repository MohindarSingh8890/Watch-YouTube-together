const express = require("express");
const cors = require("cors");
const path = require("path");
const roomsRouter = require("./routes/rooms");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/rooms", roomsRouter);

// A production build can be served by the same Express process as Socket.IO.
// Vite still serves the UI independently during local development.
const clientDist = path.join(__dirname,"..", "..", "frontend", "dist");
app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

module.exports = app;
