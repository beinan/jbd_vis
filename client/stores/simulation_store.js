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

      case ActionType.ADD_WATCH_FIELD:
        sim_store = this_store.get('simulation_map').get(this_store.get('active_jvm_id'));
        sim_store.getMonitorStore().addField(action.field_name);;
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
    
    this.set('monitor_store', new MonitorStore(this.get('jvm_id')));
    //this.load_source("Plant");
    
  }
  
  tick(){
    var current_tick = this.get('tick', 1);
    var this_store = this;
    this.updateTick(current_tick + 1);
  }
  
  load_source(source_classname){
   /*var this_store = this;
   getJson('/api/get_source').then((data) => {
      console.log("source code loaded", data);
      this_store.source_code = data;
    }).catch(console.log);*/
  }
  
  get_source(start_line,end_line){
    
    return this.source_code.source.slice(start_line, end_line);
  }
  
  updateTick(new_tick){
    if(!this.signal_cache[new_tick]){
      this.replayPause();
      this.load(new_tick).then(function(){
        this_store.replayStart();
        //this_store.tick();// tick again
      });
    }else{
      console.log("new signal", this.signal_cache[new_tick]);
      
      this.set('tick', new_tick);
      this.getMonitorStore().reload(new_tick);
    }
    //this.set('tick', new_tick);
    
  }

  load(start_tick){
    var this_store = this;
    return getJson('/api/get_next_signals/', {start_seq: start_tick, jvm_id:this.get('jvm_id')}).then((data) => {
      
      //console.log("signal data fected from ", data);      
      for(var s of data){
        //console.log("signal", s.seq, s);
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
  
  getCurrentSignalDetailStore(){
    if(this.getCurrentSignal())
      return new SimulationDetailStore(this.get("jvm_id"),this.getCurrentSignal()._id);
    return null;
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
    //this.set('tick', seq);
    this.updateTick(seq);
  }

  replayStepForward(step_length){
    var seq = this.get('tick', 1) + step_length;
    //this.set('tick', seq);
    this.updateTick(seq);
  }

  getMonitorStore(){
    return this.get('monitor_store');
  }
  
};

/**
 * Maintain detail info about each signal in simualtion
 */
export class SimulationDetailStore extends RemoteStore{
  constructor(jvm_id, signal_id){
    super({jvm_id: jvm_id},{url:'/api/signal_code_detail/'+signal_id});    
  }
};


export class MonitorStore extends CommonStore{
  constructor(jvm_id){
    super({jvm_id:jvm_id, fields:new Immutable.Set(), data:{}});
    //this.set('fields', new Immutable.Set());
  }
  
  addField(field_name){
    console.log('add field to watch', field_name);
    this.set('fields', this.get('fields').add(field_name));
    this.reload(this.get('last_load_seq', 0));
  }
  reload(seq){
    this.set('last_load_seq', seq);
    this.set('status', 'loading');
    var this_store = this;
    postJson("/api/field_monitor", {
      fields: this.get('fields').toArray(), 
      seq:seq,
      jvm_id: this.get('jvm_id')
    }).then((data) => {
      
      console.log("monitor data received ", data);      
      this_store.merge(assign({'status':"ready"}, data));
       
    }).catch(function(err){
      console.log(err, err.stack);
    });
  }
};

