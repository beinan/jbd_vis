var AppDispatcher = require('../app_dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionType = require('../action_type');
var assign = require('object-assign');

var postJson = require('../utils/ajax.js').postJson;


import SimulationAction from '../actions/simulation_action';


import {CommonStore, RemoteStore} from './common_stores';
import Immutable from 'immutable';

import {getJson} from '../utils/ajax';

export class SimulationListStore extends CommonStore{
  constructor(){
    super({simulation_map: Immutable.Map()});    
    var this_store = this;
    AppDispatcher.register(function(action) {
      var sim_store;
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
        sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.replayStart();
        break;
      
      case ActionType.REPLAY_PAUSE:
        sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.replayPause();
        break;

      case ActionType.REPLAY_JUMP_TO:
        sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.replayJumpTo(action.seq);
        break;
      case ActionType.REPLAY_STEP_FORWORD:
        sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.replayStepForward(action.step_length);
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
    
    this.load_source("Plant");
    
  }
  
  tick(){
    var current_tick = this.get('tick', 1);
    var this_store = this;
    if(!this.signal_cache[current_tick]){
      this.replayPause();
      this.load(current_tick).then(function(){
        this_store.replayStart();
        //this_store.tick();// tick again
      });
    }else{
      console.log("current signal", this.signal_cache[current_tick]);
      
      this.set('tick', current_tick + 1);
    }
  }
  
  load_source(source_classname){
    var this_store = this;
   getJson('/api/parse_java').then((data) => {
      console.log("source code loaded", data);
      this_store.source_code = data;
    }).catch(console.log);
  }
  
  get_source(start_line,end_line){
    
    return this.source_code.source.slice(start_line, end_line);
  }

  load(start_tick){
    var this_store = this;
    return getJson('/api/get_next_signals/', {start_seq: start_tick, jvm_id:this.get('jvm_id')}).then((data) => {
      
      console.log("signal data fected from ", data);      
      for(var s of data){
        console.log("signal", s.seq, s);
        this_store.signal_cache[s.seq] = s;
        SimulationAction.addOutSignal(s);        
      }
      
    }).catch(function(err){
      console.log(err, err.stack);
    });
    
  }
  
  getCurrentSignal(){
    var current_tick = this.get('tick', 0);   
    return this.signal_cache[current_tick];
  }
  
  replayStart(){
    if(this.interval_var)
      clearInterval(this.interval_var);
    this.interval_var = setInterval(this.tick.bind(this), this.get("interval", 1000));
    
  }

  replayPause(){
    if(this.interval_var)
      clearInterval(this.interval_var);
    
  }
  
  replayJumpTo(seq){
    this.set('tick', seq);
  }

  replayStepForward(step_length){
    var seq = this.get('tick', 1) + step_length;
    this.set('tick', seq);
  }
  
};




