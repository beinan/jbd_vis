var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

class SimulationAction {    
  startSimulation(jvm_store){
    console.log("simulation action: start simulation", jvm_store);
    AppDispatcher.dispatch({
      actionType: ActionType.START_SIMULATION,
      jvm_store: jvm_store
    });
  }

  actorDidMounted(actor){
    console.log("actor did mounted", actor);
    AppDispatcher.dispatch({
      actionType: ActionType.ACTOR_DID_MOUNTED,
      actor: actor
    });
  }
  
  replayJumpTo(signal){
    console.log("replay jump to:", signal);
    AppDispatcher.dispatch({
      actionType: ActionType.REPLAY_JUMP_TO,
      signal: signal
    });
  }
}

let instance = new SimulationAction();
export default instance;
