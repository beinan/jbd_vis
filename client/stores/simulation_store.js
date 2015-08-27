var AppDispatcher = require('../app_dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionType = require('../action_type');
var assign = require('object-assign');

var postJson = require('../utils/ajax.js').postJson;

var SeqDiagStore = require('./seq_diag_store.js');

var _data = {seq_diagrams:{}};

var SimulationStore = assign({}, EventEmitter.prototype, {
  
  UPDATA_EVENT : 'update_event',
  
  reload: function(jvm_store){
    console.log("reload simulation seq diagram data",jvm_store);
    _data.seq_diagrams[jvm_store._id] = new SeqDiagStore(jvm_store);
    this.setActiveJvm(jvm_store._id);
    this.emitChange();
   
  },

  setActiveJvm: function(jvm_name){
    console.log("setting active jvm_name", jvm_name);
    _data.active_jvm_name = jvm_name;
  },

  getData: function(){
    return _data;
  },
  
  emitChange: function() {
    this.emit(this.UPDATE_EVENT);
  },

  
  addUpdateEventListener: function(callback) {
    this.on(this.UPDATE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeUpdateEventListener: function(callback) {
    this.removeListener(this.UPDATE_EVENT, callback);
  }
});


// Register callback to handle all updates
AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case ActionType.START_SIMULATION:
    console.log("invoke simulation store reload", action.jvm_store);
    SimulationStore.reload(action.jvm_store);
    break;
  
    case ActionType.ACTOR_DID_MOUNTED:
    console.log("actor did mounted", action.actor);
    _data.seq_diagrams[action.actor.jvm_name].reconcile_actor(action.actor);
    break;

    case ActionType.REPLAY_JUMP_TO:
    _data.seq_diagrams[action.signal.jvm_name].replayJumpTo(action.signal);
    break;

    default:
      // no op
  }
});


export default SimulationStore;
