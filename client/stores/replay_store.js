var assign = require('object-assign');

var EventEmitter = require('events').EventEmitter;

var getJson = require('../utils/ajax.js').getJson;

const UPDATE_EVENT = 'UPDATE_EVENT';


class ReplayStore extends EventEmitter{

  constructor(){
    super();
    
  }

  reload(lifeline){
    this.lifeline = lifeline;
    console.log("reload replay store with lifelien", lifeline);
    
    getJson("/api/get_method_invocation_info/", {from_lifeline_id: this.lifeline._id}).then(
      (data)=>{
        console.log(data);
        this.data = data;
        this.emitChange();
      }
    ).catch(
      (err)=>{
        console.log(err);
        throw err;
      }
    );
    
  }

  emitChange() {
    this.emit(UPDATE_EVENT);
  }
   
  addUpdateEventListener(callback){
    this.on(UPDATE_EVENT, callback);
  }

  
  removeUpdateEventListener(callback){
    this.removeListener(UPDATE_EVENT, callback);
  }

}

export default ReplayStore;
