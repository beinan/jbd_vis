var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');
var getJson = require('../utils/ajax.js').getJson;

const UPDATE_EVENT = "update_event";


export class CommonStore extends EventEmitter{
  constructor(initData = {}){
    super();
    this._data = Immutable.Map(initData);    
  }

  merge(new_data, doesNotify = true){
    //update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>
    console.log("update", doesNotify, new_data);
    this._data = this._data.merge(Immutable.Map(new_data));
    if(doesNotify)
      this.emitChange();
    console.log("update finished");
  }
  
  set(k, v, doesNotify = true){
    this._data = this._data.set(k, v);
    if(doesNotify)
      this.emitChange();
  }

  delete(k){
    this._data = this._data.delete(k);
    this.emitChange();
  }

  get(k, default_value){
    var value = this._data.get(k);
    return value?value:default_value;
  }
  
  getData(){
    return this._data;
  }

  emitChange() {
    try{
      console.log("emitting change start:", this.constructor.name);
      this.emit(UPDATE_EVENT);
      console.log("emitting change finished:", this.constructor.name);
    }catch(e){
      console.error("emit change error", e);  
    }
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



export class RemoteStore extends CommonStore{
  constructor(initData = {}, options = {}){
    initData.status = 'init';
    super(initData);
    this._options = options;
    if(options.url && !options.lazy){
      this.reload();
    }
  }

  reload(){
    this.set('status', 'loading');
    var this_store = this;
    getJson(this._options.url).then((data) => {
      
      console.log("data fected from ", this._options, data);      
      this_store.merge(assign({'status':"ready"}, this_store.process_remote_data(data)));
       
    }).catch(function(err){
      console.error("reload error", err, err.stack);
    });
  }
  
  /**
   * 
   */
  process_remote_data(data){
    return {data: data};
  }
};
