var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

class JVMAction {    
  selectClass(jvm_id, class_id, is_selected){
    AppDispatcher.dispatch({
      actionType: ActionType.SELECT_CLASS,
      jvm_id: jvm_id,
      class_id: class_id,
      is_selected: is_selected
    });
  }
  
  startBuild(jvm_id){
    AppDispatcher.dispatch({
      actionType: ActionType.START_BUILD,
      jvm_id: jvm_id
    });
  }

  finishBuild(jvm_id, seq_diag_data){
    AppDispatcher.dispatch({
      actionType: ActionType.FINISH_BUILD,
      jvm_id: jvm_id,
      data: seq_diag_data
    });
  }
  
  queryJvms(page_num, page_size){
    AppDispatcher.dispatch({
      actionType: ActionType.QUERY_JVMS,
      page_num: page_num,
      page_size: page_size
    });
  }
  
}

let instance = new JVMAction();
export default instance;
