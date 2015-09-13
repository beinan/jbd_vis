
var keyMirror = require('keymirror');

module.exports = keyMirror({
  STORE_UPDATE: null,
  STORE_SET: null,
  STORE_DELETE: null,
  APP_HEIGHT_CHANGE: null,
  APP_VIEW_CHANGE: null,
  QUERY_JVMS: null,
  SELECT_CLASS:null,
  START_BUILD:null,
  FINISH_BUILD:null,
  START_SIMULATION: null,
  ACTOR_DID_MOUNTED: null,
  THREAD_RECT_DID_MOUNTED: null,
  REPLAY_JUMP_TO: null,
  REPLAY_START: null,
  REPLAY_PAUSE: null
});
