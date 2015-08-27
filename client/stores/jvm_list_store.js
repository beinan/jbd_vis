var AppDispatcher = require('../app_dispatcher');
var EventEmitter = require('events').EventEmitter;
var ActionType = require('../action_type');
var assign = require('object-assign');

var getJson = require('../utils/ajax.js').getJson;

import JvmStore from './jvm_store';

var _jvm_list = {status:'init', jvm_list:[]};

console.log("jvmstore", JvmStore);
var JvmListStore = assign({}, EventEmitter.prototype, {
  
  JVM_UPDATE_EVENT : 'jvm_update_event',
  //ACTIVE_ASSIGNMENT_EVENT : 'active_assignment',
  
  reload: function(page_num, page_size){
    _jvm_list.page_num = page_num;
    _jvm_list.page_size = page_size;
    _jvm_list.status = "loading";
    JvmListStore.emitChange();
    var params = {start: page_num*page_size, page_size:page_size};
    getJson('/api/jvms', params).then((data) => {
      console.log(data);
      _jvm_list.jvm_list = data.map(function(jvm_process) {
        console.log(jvm_process);
        //return jvm_process;
        return new JvmStore(jvm_process);
      }); 
      console.log(_jvm_list.jvm_list);
      _jvm_list.status = "ready";
      JvmListStore.emitChange();
    });
  },

  getData: function(){
    return _jvm_list;
  },
  
  emitChange: function() {
    this.emit(this.JVM_UPDATE_EVENT);
  },

  
  addUpdateEventListener: function(callback) {
    this.on(this.JVM_UPDATE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeUpdateEventListener: function(callback) {
    this.removeListener(this.JVM_UPDATE_EVENT, callback);
  }
});

//load init data into jvm list
JvmListStore.reload(0, 20);

// Register callback to handle all updates
AppDispatcher.register(function(action) {

  switch(action.actionType) {
    case ActionType.QUERY_JVMS:
    _jvm_list.reload(action.page_num, action.page_size);
    break;

    
    default:
      // no op
  }
});


export default JvmListStore;
