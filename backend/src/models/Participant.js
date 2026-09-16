const { v4: uuidv4 } = require("uuid");

class Participant {
  constructor(username, socketId) {
    this.id = uuidv4();
    this.socketId = socketId;
    this.username = username;
    this.role = null; // set by the room when adding
    this.joinedAt = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      role: this.role,
      joinedAt: this.joinedAt,
    };
  }

  // rebuild from a stored record; socketId is lost on restart on purpose
  static fromJSON(data) {
    if (!data || typeof data.username !== "string") return null;
    const p = new Participant(data.username.slice(0, 30), null);
    if (typeof data.id === "string" && data.id) p.id = data.id;
    if (typeof data.role === "string") p.role = data.role;
    if (Number.isFinite(data.joinedAt)) p.joinedAt = data.joinedAt;
    return p;
  }
}

module.exports = Participant;