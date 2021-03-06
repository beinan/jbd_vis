var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

class SimulationAction {    
  startSimulation(jvm_id){
    console.log("simulation action: start simulation", jvm_id);
    AppDispatcher.dispatch({
      actionType: ActionType.START_SIMULATION,
      jvm_id: jvm_id
    });
  }

  actorDidMounted(jvm_id, actor_id, head_box){
    console.log("actor did mounted", actor_id);
    AppDispatcher.dispatch({
      actionType: ActionType.ACTOR_DID_MOUNTED,
      jvm_id: jvm_id,
      actor_id: actor_id,
      head_box: head_box
    });
  }
  
  threadRectDidMounted(jvm_id, actor_id, thread_id, center_x){
    console.log("thread react did mounted", actor_id, thread_id, center_x);
    AppDispatcher.dispatch({
      actionType: ActionType.THREAD_RECT_DID_MOUNTED,
      jvm_id: jvm_id,
      actor_id: actor_id,
      thread_id: thread_id,
      center_x: center_x
    });
  }
  
  activeLifeline(lifeline_id){
    AppDispatcher.dispatch({
      actionType: ActionType.ACTIVE_LIFELINE,
      lifeline_id : lifeline_id
    });
 
  }

  addOutSignal(signal){
    AppDispatcher.dispatch({
      actionType: ActionType.ADD_OUT_SIGNAL,
      signal:signal
    });
  }

  replayStart(){
    AppDispatcher.dispatch({
      actionType: ActionType.REPLAY_START
    });
  }
  
  replayPause(){
    AppDispatcher.dispatch({
      actionType: ActionType.REPLAY_PAUSE
    });
  }
  replayJumpTo(seq){
    //console.log("replay jump to:", signal);
    AppDispatcher.dispatch({
      actionType: ActionType.REPLAY_JUMP_TO,
      seq: seq
    });
  }
  replayStepForward(step_length){
    AppDispatcher.dispatch({
      actionType: ActionType.REPLAY_STEP_FORWORD,
      step_length: step_length
    });
  }
  
  addWatchField(field_name){
    AppDispatcher.dispatch({
      actionType: ActionType.ADD_WATCH_FIELD,
      field_name: field_name
    });
  }
}

let instance = new SimulationAction();
export default instance;
