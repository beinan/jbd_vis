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
    var from_actor_id = this.get('from_lifeline')? this.get('from_lifeline').get('actor').get('_id'):undefined;
    var to_actor_id = this.get('to_lifeline')?this.get('to_lifeline').get('actor').get('_id'):undefined;
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

      case ActionType.ACTIVE_LIFELINE:  //active this signal if the to_lifeline is actived
        if(this_store.get('to_lifeline') && this_store.get('to_lifeline').get('_id') == action.lifeline_id){
          console.log("signal active", action); 
          this_store.set("active", true);          
        }else if(this_store.get('to_lifeline') && this_store.get('to_lifeline').get('_id') != action.lifeline_id && this_store.get("active") == true){
          console.log("signal inactive", action); 
          this_store.set("active", false);          
        }
        
        break;
        
      default:
        // no op
      }
    });

  }

  getTitle(){
    return this.get('method_desc');
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
      case ActionType.ACTIVE_LIFELINE:
        if(this_store.get('_id') == action.lifeline_id){
          console.log("lifeline active", action); 
          this_store.set("active", true);          
        }else if(this_store.get('_id') != action.lifeline_id && this_store.get("active") == true){
          console.log("lifeline inactive", action); 
          this_store.set("active", false);          
        }
        
        break;
      case ActionType.ADD_OUT_SIGNAL:
        if(this_store.get('_id') == action.signal.from_id){
          if(!this_store.get('out_signals').get(action.signal._id)){
            //calculate y pos of this out signal
            action.signal.y = this_store.get('seq_diag_store').getYPosBySeq(action.signal.seq);
            console.log('adding out signal', action.signal);
            var new_out_signals = this_store.get('out_signals').set(action.signal._id, action.signal);
            this_store.set('out_signals', new_out_signals);
            
            //update height
            if(this_store.get('y') + this_store.get('height') < action.signal.y){
              this_store.set('height', action.signal.y - this_store.get('y') + 5);
            }
            if(this_store.get('y') > action.signal.y){
              this_store.set('y', action.signal.y - 2);
            }
          }
          
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
      
      //lifeline.in_signal_ids = Immutable.Map();
      lifeline.out_signals = Immutable.Map();
      lifeline.seq_diag_store = this;
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
      if(signal.from_lifeline && signal.to_lifeline && signal.from_lifeline.get("actor") == signal.to_lifeline.get("actor")){
        height +=20; 
      }
      this.y += height + 6;
      var update_lifeline_y = (lifeline)=>{
        if(lifeline){
          if(!lifeline.get("y"))
            lifeline.set("y", signal.y + 8);
          lifeline.set("height",  signal.y - lifeline.get('y') + height);
        }
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

  /**
   * return y position of the out signal's seq value passed in.
   */
  getYPosBySeq(seq){
    var signals = this.get('signal_map').toArray();
    //console.log('watch signals', signals.map((s)=>{return s.get('seq');}));
    for(var i = 1; i < signals.length; i++){
      if(seq == signals[i].get('seq')){
        return signals[i].get('y') + 12;
      } else if(seq < signals[i].get('seq')){
        //var previous_signal_y = START_Y + 5;
        //var previous_signal_seq = 0;
        
        var previous_signal_y = signals[i-1].get('y');
        var previous_signal_seq = signals[i-1].get('seq');
        
        //height for each out signals
        var seq_height = (signals[i].get('y') - previous_signal_y - 5) / (signals[i].get('seq') - previous_signal_seq);
        return previous_signal_y + (seq - previous_signal_seq) * seq_height + 12;
      }
      
    }
    
    //for the out signals after the last signal on the diagram
    return signals[signals.length - 1].get('y') + 2*(seq - signals[signals.length - 1].get('seq')) + 12;
  }

};



