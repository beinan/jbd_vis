var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

class JVMAction {    
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
