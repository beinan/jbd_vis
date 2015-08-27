var assign = require('object-assign');

var EventEmitter = require('events').EventEmitter;
var postJson = require('../utils/ajax.js').postJson;

import ReplayStore from './replay_store';

const UPDATE_EVENT = 'UPDATE_EVENT';
const REPLAY_UPDATE_EVENT = 'REPLAY_UPDATE';

const START_X = 80;  //start position for actor rendering
const START_Y = 100;
const ACTOR_MARGIN = 20;
class SeqDiagStore extends EventEmitter{

  constructor(jvm_store){
    super();
    this.jvm_store = jvm_store;
   
    this._data = {status: "init", jvm_name: jvm_store._id};
    this.update();
    this.x = START_X;
    this.y = START_Y;
    this.replay_store = new ReplayStore();
  }

  getData(){
    return this._data;
  }

  reconcile_actor(actor){
    console.log("reconcile actor", this);
    actor.rendering_data.position_x = this.x;
    actor.rendering_data.height = this.y;
    if(actor.rendering_data && actor.rendering_data.head_box){
      this.x = this.x + actor.rendering_data.head_box.width + ACTOR_MARGIN;
      var threads_count = Object.keys(actor.threads).length;
      //console.log("reconcile each thread in this actor", threads_count);
      this.emitChange();
    }else{
      console.log(this, actor);
      throw "reconsile actor error: the redering data is invalid";
    }
  }
  
  replayJumpTo(signal){
    if(this.curr_replay_signal){
      this.curr_replay_signal.is_replay_on = false;
      this.curr_replay_signal.emit("REPLAY_UPDATE");
    }
    signal.is_replay_on = true;
    this.curr_replay_signal = signal;
    signal.emit("REPLAY_UPDATE");
    this.replay_store.reload(signal.to_lifeline);//store for replay panel
    this.emitReplayEvent();
  }
  
  buildDataRelation(actors, signals, lifelines){
    var actor_map = {};
    var lifeline_map = {};
    for(var actor of actors){
      //console.log("build rel", actor);
      actor_map[actor._id] = actor;
      actor.threads = {};
    }
    for(var lifeline of lifelines){
      var actor_id = lifeline._id.split(':').slice(0,3).join(':');
      lifeline.actor = actor_map[actor_id];
      lifeline.actor.threads[lifeline.thread_id] = {center_x:0};
      var lifeline_short_id = lifeline._id.split(':').slice(3,5).join(':');
      //console.log("short id", lifeline_short_id);
      lifeline_map[lifeline_short_id] = lifeline;
    }
    for(let i in signals){
      signals[i] = assign(signals[i], EventEmitter.prototype); 
      var signal = signals[i];
      signal.index = i;
      signal.from_lifeline = lifeline_map[signal.from_id.split(':').slice(3,5).join(':')];
      signal.to_lifeline = lifeline_map[signal.thread_id + ":" + (signal.invocation_id + 1)]; //+1 for next method enter.
      //todo: improve me later:
      signal.y = this.y;
      var height = 35;
      if(signal.from_lifeline.actor == signal.to_lifeline.actor){
        height +=20; 
      }
      this.y += height + 6;
      var update_lifeline_y = (lifeline)=>{
        if(!lifeline.y)
          lifeline.y = signal.y + 5;
        lifeline.height = signal.y - lifeline.y + height;
      };
      update_lifeline_y(signal.from_lifeline);
      update_lifeline_y(signal.to_lifeline);

    }
    
  }


  
  update(){
    console.log("reload seq diagram store", this);
    this.jvm_store.getSeqDiagram().then(
      (data) =>{
        console.log("seq data loaded", this.jvm_store._id, data);
        this._data.status = "ready", 
        this._data.data = data.data;
        this.buildDataRelation(data.data.actors, data.data.signals, data.data.lifelines);
        this.emitChange();
      }
    ).catch(
      (err)=>{
        console.log(err);
        throw err;
      }
    );
  }
  emitChange() {
    this.emit(UPDATE_EVENT);
  }
   
  addUpdateEventListener(callback){
    this.on(UPDATE_EVENT, callback);
  }

  
  removeUpdateEventListener(callback){
    this.removeListener(UPDATE_EVENT, callback);
  }

  emitReplayEvent() {
    this.emit(REPLAY_UPDATE_EVENT);
  }
   
  addReplayEventListener(callback){
    this.on(REPLAY_UPDATE_EVENT, callback);
  }

  
  removeReplayEventListener(callback){
    this.removeListener(REPLAY_UPDATE_EVENT, callback);
  }
}

export default SeqDiagStore;
