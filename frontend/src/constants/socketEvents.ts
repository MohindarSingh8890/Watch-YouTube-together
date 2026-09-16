// mirrors the event names used by the backend
export const EVENTS = {
  // client -> server
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  PLAY: 'play',
  PAUSE: 'pause',
  SEEK: 'seek',
  CHANGE_VIDEO: 'change_video',
  ASSIGN_ROLE: 'assign_role',
  REMOVE_PARTICIPANT: 'remove_participant',
  TRANSFER_HOST: 'transfer_host',
  REQUEST_CONTROL: 'request_control',
  CHAT_MESSAGE: 'chat_message',
  REACTION: 'reaction',

  // server -> client
  SYNC_STATE: 'sync_state',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ROLE_ASSIGNED: 'role_assigned',
  PARTICIPANT_REMOVED: 'participant_removed',
  HOST_TRANSFERRED: 'host_transferred',
  CONTROL_REQUESTED: 'control_requested',
  ERROR_EVENT: 'error_event',
};