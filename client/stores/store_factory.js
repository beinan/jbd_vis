var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

import {CommonStore, RemoteStore} from './common_stores';
import {JmvStore, JvmProcessListStore} from './jvm_store';
import {SimulationListStore} from './simulation_store';

class StoreFactory{
  constructor(){
    this._appStore = new CommonStore();
    this._jvmProcessListStore = new JvmProcessListStore();
    this._simulationListStore = new SimulationListStore();
  }

  /**
   * storage for the whole application
   */
  getAppStore(){
    return this._appStore;
  }
  
  getJvmProcessListStore(){
    return this._jvmProcessListStore;
  }
  
  getSimulationListStore(){
    return this._simulationListStore;
  }
  
}

let instance = new StoreFactory();

AppDispatcher.register(function(action) {
  
   
  switch(action.actionType) {
  case ActionType.APP_HEIGHT_CHANGE:
    instance.getAppStore().set("height", action.height);
    break;

  case ActionType.APP_VIEW_CHANGE:
    instance.getAppStore().merge({"view_name":action.view_name, "view_params":action.params});
    break;

  case ActionType.QUERY_JVMS:
    instance.getJvmProcessListStore.reload();
    break;

    
  default:
      // no op
  }
});



export default instance;
