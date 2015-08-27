var assign = require('object-assign');

var EventEmitter = require('events').EventEmitter;
var getJson = require('../utils/ajax.js').getJson;
var postJson = require('../utils/ajax.js').postJson;

const UPDATE_EVENT = 'UPDATE_EVENT';


class JvmStore extends EventEmitter{

  constructor(jvm_process_data){
    super();
    
    assign(this, jvm_process_data);
    this.methods_meta_data = {status: "init"};
    this.update();
    
  }

  update(){
    console.log("update job store", this);
    //this.data.status = "loading";
    //this.emit(UPDATE_EVENT);
    getJson('/api/methods_meta/' + this._id).then((data) => {
      this.methods_meta_data.classes = data; 
      this.methods_meta_data.status = "ready";
      console.log("method_meta_data is ready", data);
      this.emit(UPDATE_EVENT);
    });
  }
  
  buildSeqDiagram(){
    var data = {id: this._id};
    data.selected_classes = this.methods_meta_data.classes.filter((c) => c.checked).map((c)=>c._id);
    console.log("query traces for jvm:", data);
   
    return postJson('/api/build_seq_diag', data);
  }
  
  getSeqDiagram(){
    var data = {id: this._id};
    data.selected_classes = this.methods_meta_data.classes.filter((c) => c.checked).map((c)=>c._id);
    console.log("get seq diagram for jvm:", data);
   
    return postJson('/api/get_seq_diag', data);
  }

  
  addUpdateEventListener(callback){
    this.on(UPDATE_EVENT, callback);
  }

  
  removeUpdateEventListener(callback){
    this.removeListener(UPDATE_EVENT, callback);
  }
}

export default JvmStore;
