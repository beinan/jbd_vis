var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

class AppAction {
    
  setHeight(height){
    AppDispatcher.dispatch({
      actionType: ActionType.APP_HEIGHT_CHANGE,
      height:height
    });
  }

  setView(view_name, params){
    console.log("set view", view_name, params);
    AppDispatcher.dispatch({
      actionType: ActionType.APP_VIEW_CHANGE,
      view_name: view_name,
      params: params
    });
  }
}

let instance = new AppAction();
export default instance;
