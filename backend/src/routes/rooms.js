const express = require("express");
const { roomExists } = require("../services/roomService");

const router = express.Router();

router.get("/:roomCode/exists", (req, res) => {
  const { roomCode } = req.params;
  // normalize in case someone types it lowercase
  const code = roomCode.toUpperCase();
  res.json({ exists: roomExists(code) });
});

module.exports = router;