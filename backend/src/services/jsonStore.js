const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_DATA = { rooms: {} };

function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    if (!raw.trim()) return resetFile();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.rooms) return resetFile();
    return parsed;
  } catch (err) {
    // missing file, empty file, or corrupt JSON — start clean and recreate it
    return resetFile();
  }
}

function writeData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function resetFile() {
  writeData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

module.exports = { readData, writeData };