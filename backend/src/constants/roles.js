const ROLES = {
  HOST: "host",
  MODERATOR: "moderator",
  PARTICIPANT: "participant",
};

// host + mod can drive playback, everyone else just watches
const CONTROL_ROLES = new Set([ROLES.HOST, ROLES.MODERATOR]);

module.exports = { ROLES, CONTROL_ROLES };