var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');

const _stores = {};
const UPDATE_EVENT = "update_event";


class CommonStore extends EventEmitter{
  constructor(initData = {}){
    super();
    this._data = Immutable.Map(initData);    
  }

  merge(new_data){
    //update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>
    console.log("update", new_data);
    this._data = this._data.merge(Immutable.Map(new_data));
    this.emitChange();
    console.log("update finished");
  }
  
  set(k, v){
    this._data = this._data.set(k, v);
    this.emitChange();
  }

  delete(k){
    this._data = this._data.delete(k);
    this.emitChange();
  }

  get(k){
    return this._data.get(k);
  }
  
  getData(){
    return this._data;
  }

  emitChange() {
    this.emit(UPDATE_EVENT);
  }

  
  addEventListener(callback) {
    this.on(UPDATE_EVENT, callback);
  }

  /**
   * @param {function} callback
   */
  removeEventListener(callback) {
    this.removeListener(UPDATE_EVENT, callback);
  }
}


var getJson = require('../utils/ajax.js').getJson;

class RemoteListStore extends CommonStore{
  constructor(initData = {}, options = {}){
    super(initData);
    this._data = Immutable.Map(initData);
    this._options = options;
    if(options.url && !options.lazy){
      this.reload();
    }
  }

  reload(){
    this.set('status', 'Loading');
    var this_store = this;
    getJson(this._options.url).then((data) => {
      console.log("data fected from ", this._options, data);
      var array_data = data.map(function(item) {
        console.log(item);
        //return jvm_process;
        let JvmStore = require('./jvm_store');
        return new JvmStore(item);
      }); 
      //put array to an immutable list
      console.log("array_data", array_data);
      this_store.merge({'status':"ready", 'list': Immutable.List(array_data)}); 
    }).catch(function(err){
      throw err;
    });
  }
}

class StoreFactory{
  constructor(){
    this._appStore = new CommonStore();
    this._jvmProcessListStore = new RemoteListStore({status:"init"}, {url:'/api/jvms'});
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

  getOrCreateStore(store_id){
    if(!_stores[store_id])
      _stores[store_id] = new CommonStore();
    return _stores[store_id];
  }
}

let instance = new StoreFactory();

AppDispatcher.register(function(action) {
  
   
  switch(action.actionType) {
    case ActionType.APP_HEIGHT_CHANGE:
      instance.getAppStore().set("height", action.height);
      break;

    case ActionType.APP_VIEW_CHANGE:
      instance.getAppStore().set("view_name", action.view_name);
      break;


  
    default:
      // no op
  }
});



export default instance;
