var AppDispatcher = require('../app_dispatcher');
var ActionType = require('../action_type');

var assign = require('object-assign');

var getJson = require('../utils/ajax.js').getJson;
var postJson = require('../utils/ajax.js').postJson;

var JvmAction = require('../actions/jvm_action');

import {CommonStore, RemoteStore} from './common_stores';
import {SeqDiagStore, ActorStore, SignalStore, LifelineStore} from './seq_diag_store';
import Immutable from 'immutable';


export class JvmClassMetaStore extends CommonStore{
  constructor(class_meta_data){
    super(class_meta_data);    
  }
};


export class JvmStore extends RemoteStore{

  constructor(jvm_process_data){
    super(jvm_process_data, {url: '/api/methods_meta/' + jvm_process_data._id});
    
  }
  
  process_remote_data(data){
    let this_store = this;
    var array_data = data.map(function(item) {
      console.log(item);
      item.jvm_id = this_store.get("_id");
      return [item._id, new JvmClassMetaStore(item)];
    }); 
    return {'class_meta_map': Immutable.Map(array_data)};
  }

  getClassMeta(class_id){
    return this.get('class_meta_map').get(class_id);
  }
  
  /**
   * Build the sequence diagram and fetch the data back.
   * Sending two requests to the server
   * 1. build sequence diagram "/api/build_seq_diag"
   * 2. get sequence diagram data "/api/get_seq_diag"
   */
  startBuild(){
    this.get('seq_diag_store').set("status", "building");
    var post_data = {id: this.get("_id")}; //init the data posted to server
    post_data.selected_classes = this.get("class_meta_map")
      .toArray()  //immutable map to array of values, all the keys are discarded
      .filter((c) => c.get("is_selected"))  //select checked classes only
      .map((c)=>c.get("_id"));  //select the _id(contains class package and name) of each class
    console.log("query traces for jvm:", post_data);
    var this_store = this;
    return postJson('/api/build_seq_diag', post_data).then(function(data){  //builder diagram data
      console.log("build finished", data);
      this_store.get('seq_diag_store').set("status", "loading");
      return postJson('/api/get_seq_diag', post_data).then(function(data){  //loading diagram data
        console.log("diagram data", data);
        JvmAction.finishBuild(this_store.get('_id'), data.data);
      });
    }).catch(function(err){
      console.log(err);
      this_store.get('seq_diag_store').set("status", "error");
    });
  }
  
  getSeqDiagram(){
    return this.get('seq_diag_store');
  }
  

};


export class JvmProcessListStore extends RemoteStore{
  constructor(){
    super({},{url:'/api/jvms'});
    this._jvms = Immutable.Map();
    
    var this_store = this;
    AppDispatcher.register(function(action) {
           
      switch(action.actionType) {
      case ActionType.SELECT_CLASS:
        this_store.getJvm(action.jvm_id).getClassMeta(action.class_id).set("is_selected", action.is_selected);
        break;
      case ActionType.START_BUILD:
        this_store.getJvm(action.jvm_id).startBuild();
        break;
      case ActionType.FINISH_BUILD:
        //this_store.getJvm(action.jvm_id).buildSeqDiagStore(action.data);
        this_store.updateReadySeqDiagCount(action.jvm_id);
        break;
      
      default:
        // no op
      }
    });
  }

  getJvm(jvm_id){
    return this.get('jvm_map').get(jvm_id);
  }
  
  updateReadySeqDiagCount(ready_jvm_id){
    //recount the number of the ready sequence diagram of all the jvms
    console.log("counting ready seq diagrams", this, ready_jvm_id);
    var count = 0;
    this.get("jvm_map").toArray().forEach(function(jvm_store){
      if(jvm_store.get('_id') == ready_jvm_id || jvm_store.get('seq_diag_store').get('status') == 'ready')
        count ++;
    });
    this.set("ready_seq_count", count);
  }
  process_remote_data(data){
    var array_data = data.map(function(item) {
      console.log(item);
      item.seq_diag_store = new SeqDiagStore({status: 'init', jvm_id: item._id});
      return [item._id,  new JvmStore(item)]; //create a map entry
      
     
    }); 
    return {'jvm_map': Immutable.Map(array_data)};
  }
  
  
};



