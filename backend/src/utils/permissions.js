const { ROLES, CONTROL_ROLES } = require("../constants/roles");

function canControlPlayback(participant) {
  return CONTROL_ROLES.has(participant.role);
}

function isHost(participant) {
  return participant.role === ROLES.HOST;
}

module.exports = { canControlPlayback, isHost };