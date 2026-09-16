const Room = require("../models/Room");
const { readData, writeData } = require("./jsonStore");
const generateRoomCode = require("../utils/generateRoomCode");

const rooms = new Map();

function loadRooms() {
  const data = readData();
  const stored = data.rooms || {};
  for (const code of Object.keys(stored)) {
    const room = Room.fromStorage(stored[code]);
    if (room && room.code) rooms.set(room.code, room);
  }
}

function saveRooms() {
  const data = { rooms: {} };
  for (const [code, room] of rooms) {
    data.rooms[code] = room.toStorage();
  }
  writeData(data);
}

function createRoom(host) {
  let code;
  do {
    code = generateRoomCode();
  } while (rooms.has(code));

  const room = new Room(host);
  room.code = code;
  rooms.set(code, room);
  saveRooms();
  return room;
}

function joinRoom(roomCode, participant) {
  const room = rooms.get(roomCode);
  if (!room) return null;
  room.addParticipant(participant);
  saveRooms();
  return room;
}

function getRoom(roomCode) {
  return rooms.get(roomCode);
}

function roomExists(roomCode) {
  return rooms.has(roomCode);
}

function deleteRoom(roomCode) {
  rooms.delete(roomCode);
  saveRooms();
}

loadRooms();

module.exports = {
  createRoom,
  joinRoom,
  getRoom,
  roomExists,
  deleteRoom,
  saveRooms,
  rooms,
};