var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

/**
 * Common actions for all common store instance
 */
class CommonStoreAction {
  
  /**
   * @param {string} id - store id
   * @param {Object} data - data 
   */
  update(id, data){
    AppDispatcher.dispatch({
      actionType: ActionType.STORE_UPDATE,
      store_id: id,
      data: data
    });
  }
  set(id, key, value){
    AppDispatcher.dispatch({
      actionType: ActionType.STORE_SET,
      store_id: id,
      key: key,
      value: value
    });
  }
  delete(id, key){
    AppDispatcher.dispatch({
      actionType: ActionType.STORE_DELETE,
      store_id: id,
      key: key
    });
  }

  
}

let instance = new CommonStoreAction();
export default instance;
