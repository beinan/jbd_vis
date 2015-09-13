//var assign = require('object-assign');
import AppDispatcher from '../app_dispatcher';
import ActionType from '../action_type';


import {postJson} from '../utils/ajax.js';

import ReplayStore from './replay_store';


import {CommonStore, RemoteStore} from './common_stores';
import Immutable from 'immutable';

const START_X = 80;  //start position for actor rendering
const START_Y = 100;
const ACTOR_MARGIN = 20;

export class ActorStore extends CommonStore {
  constructor(props){
    super(props);    

  }

};
export class SignalStore extends CommonStore {
  constructor(props){
    super(props);    
    
    //register listener for actor position modifying
    var from_actor_id = this.get('from_lifeline').get('actor').get('_id');
    var to_actor_id = this.get('to_lifeline').get('actor').get('_id');
    var this_store = this;
    AppDispatcher.register(function(action) {           
   
      switch(action.actionType) {
      case ActionType.THREAD_RECT_DID_MOUNTED:
        if(this_store.get('jvm_name') == action.jvm_id && action.thread_id == this_store.get('thread_id') && 
           (from_actor_id == action.actor_id || to_actor_id == action.actor_id)){

          console.log("signal notified", action, action.actor_id, from_actor_id, to_actor_id);
          
          if(from_actor_id == action.actor_id){
            this_store.set("from_x", action.center_x, true);
          }
          if(to_actor_id == action.actor_id){
            this_store.set("to_x", action.center_x, true);
          }
        }
        break;

        
      default:
        // no op
      }
    });

  }

};
export class LifelineStore extends CommonStore {
  constructor(props){
    super(props);    

    var actor_id = this.get('actor').get('_id');    
    var this_store = this;
    AppDispatcher.register(function(action) {           
      
      switch(action.actionType) {
      case ActionType.THREAD_RECT_DID_MOUNTED:
        if(this_store.get('actor').get('jvm_name') == action.jvm_id && 
           action.thread_id == this_store.get('thread_id') && 
           actor_id == action.actor_id){

          console.log("lifeline notified", action, action.actor_id, actor_id); 
          this_store.set("center_x", action.center_x, true);
          
        }            
        
        break;
      default:
        // no op
      }
    });

  }

};

export class SeqDiagStore extends CommonStore {
  constructor(props){
    super(props);
    var this_store = this;
    this.x = START_X;
    this.y = START_Y;
    AppDispatcher.register(function(action) {           
      if(this_store.get('jvm_id') == action.jvm_id)
        switch(action.actionType) {
        case ActionType.ACTOR_DID_MOUNTED:

          console.log("actor did mounted", action.actor_id, action.jvm_id);          
          this_store.reconcile_actor(action.actor_id, action.head_box);
          break;

        case ActionType.FINISH_BUILD:
          this_store.buildSeqDiagStore(action.data);          
          break;
          
        default:
          // no op
        }
    });
  }

  buildSeqDiagStore(data){
    //build the relationship between actor,signal and lifeline
    
    var actors = data.actors.map((a) => {
      a.threads = Immutable.Set();  //an action may shared with multiple threads.
      return [a._id, new ActorStore(a)];
    });
    var actor_map = Immutable.Map(actors);
    
    var lifelines = data.lifelines.map((lifeline) => {
      var actor_id = lifeline._id.split(':').slice(0,3).join(':');
      var lifeline_short_id = lifeline._id.split(':').slice(3,5).join(':');
      lifeline.actor = actor_map.get(actor_id);
      var threads = lifeline.actor.get("threads").add(lifeline.thread_id);
      lifeline.actor.set("threads", threads);
      
      lifeline.in_signal_ids = Immutable.List();
      lifeline.out_signal_ids = Immutable.List();
      return [lifeline_short_id, new LifelineStore(lifeline)];
    });
    var lifeline_map = Immutable.Map(lifelines);
    
    var signals = data.signals.map((signal, i) => {
      signal.index = i;
      signal.from_lifeline = lifeline_map.get(signal.from_id.split(':').slice(3,5).join(':'));
      //var out_s_ids = signal.from_lifeline.get("out_signal_ids").push(signal._id);
      //signal.from_lifeline.set("out_signal_ids", out_s_ids);
      
      signal.to_lifeline = lifeline_map.get(signal.thread_id + ":" + (signal.invocation_id + 1)); //+1 for next method enter.
      //var in_s_ids = signal.to_lifeline.get("in_signal_ids").push(signal._id);
      //signal.to_lifeline.set("in_signal_ids", in_s_ids);
     
      //todo: improve me later:
      signal.y = this.y;
      var height = 35; //TODO: configurable or const
      if(signal.from_lifeline.get("actor") == signal.to_lifeline.get("actor")){
        height +=20; 
      }
      this.y += height + 6;
      var update_lifeline_y = (lifeline)=>{
        if(!lifeline.get("y"))
          lifeline.set("y", signal.y + 5);
        lifeline.set("height",  signal.y - lifeline.get('y') + height);
      };
      update_lifeline_y(signal.from_lifeline);
      update_lifeline_y(signal.to_lifeline);

      return [signal._id,new SignalStore(signal)];
    });
    this.set("height", this.y + 50);
    var signal_map = Immutable.OrderedMap(signals);
    
    
    
    this.merge(
      {
        actor_map: actor_map,
        signal_map: signal_map,
        lifeline_map: lifeline_map, 
        "status":"ready"
      }
    );
  }

  reconcile_actor(actor_id, head_box){
    var actor = this.get("actor_map").get(actor_id);
    console.log("reconcile actor", actor, this.x, this.y, head_box);
    actor.merge({
      position_x: this.x,
      center_x: head_box.x + head_box.width / 2,   
      height: this.y,
      head_box: head_box
    }, true);
    
    //update x for next actor
    this.x = this.x + head_box.width + ACTOR_MARGIN;
    //for svg size
    this.set("width", this.x);
  }

};



class SeqDiagStore_Old{

  constructor(jvm_store){
   
      
  
  }

  getData(){
    return this._data;
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

//export default SeqDiagStore;
