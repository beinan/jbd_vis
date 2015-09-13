var AppDispatcher = require('../app_dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionType = require('../action_type');
var assign = require('object-assign');

var postJson = require('../utils/ajax.js').postJson;

var SeqDiagStore = require('./seq_diag_store.js');

var _data = {seq_diagrams:{}};

import {CommonStore, RemoteStore} from './common_stores';
import Immutable from 'immutable';

import {getJson} from '../utils/ajax';

export class SimulationListStore extends CommonStore{
  constructor(){
    super({simulation_map: Immutable.Map()});    
    var this_store = this;
    AppDispatcher.register(function(action) {
      switch(action.actionType) {
      case ActionType.START_SIMULATION:
        console.log("active simulation chaged", action.jvm_id);
        if(!this_store.get("simulation_map").has(action.jvm_id)){
          var new_map = this_store.get('simulation_map').set(action.jvm_id, new SimulationStore({jvm_id:action.jvm_id}));
          this_store.set('simulation_map', new_map, false);
        }
        this_store.set('active_jvm_id', action.jvm_id);
        break;
        
      case ActionType.REPLAY_START:
        //_data.seq_diagrams[action.signal.jvm_name].replayJumpTo(action.signal);
        var sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.replayStart();
        break;

      case ActionType.REPLAY_JUMP_TO:
        //_data.seq_diagrams[action.signal.jvm_name].replayJumpTo(action.signal);
        break;

      default:
        // no op
      }
    });
  }
};

export class SimulationStore extends CommonStore{
  constructor(props){
    super(props);
    this.signal_cache = [];
    this.load(0);
  }
  
  tick(){
    var current_tick = this.get('tick', 0);
    if(!this.signal_cache[current_tick]){
      this.load(current_tick);
    }
    console.log("current signal", this.signal_cache[current_tick]);
    this.set('tick', current_tick + 1);
  }

  load(start_tick){
    var this_store = this;
    getJson('/api/get_next_signals/', {start_seq: start_tick}).then((data) => {
      
      console.log("signal data fected from ", data);      
      for(var s of data){
        console.log("signal", s.seq, s);
        this_store.signal_cache[s.seq] = s;
      }
      
    }).catch(function(err){
      console.log(err, err.stack);
    });
    
  }

  replayStart(){
    var this_store = this;
    if(this.interval_var)
      clearInterval(this.interval_var);
    this.interval_var = setInterval(this.tick.bind(this), this_store.get("interval", 300));
    
  }
};

var SimulationStoreOld = assign({}, EventEmitter.prototype, {
  
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



