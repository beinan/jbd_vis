var mongoose = require('mongoose');

var Trace = require('../models/Trace.js');

var buildActorAndSignals = require('../aggregation/build_seq_diag').buildActorAndSignals;

exports.buildSeqDiag = function(req, res){
  buildActorAndSignals(req.body.id, req.body.selected_classes).then(
    function(count){
      res.json({status:"finished", count: count});
    }    
  ).catch(function(err){
    res.status(500).json(err);
  });  
  
};

exports.getJvms = function(req, res) {
  var map = function(){
    if(this.method_desc){
      var info = { 
        count : 1,
        start_time: this.created_datetime
      };
      emit(this.jvm_name, info);
    }
  };
  var reduce = function(jvmname, infos){
    result = {count : 0};
    for(var i = 0; i <  infos.length; i++){
      var info = infos[i];
      result.count += info.count;
      result.start_time = info.start_time;
    }
    return result;
  };
  
  // map-reduce command
  var command = {
    map: map, // a function for mapping
    reduce: reduce // a function  for reducing
    //query: query, // filter conditions
    //out: {inline: 1}  // doesn't create a new collection, includes the result in the output obtained
  };

  // execute map-reduce command
  Trace.mapReduce(command, function(err, dbres) {
    res.json(dbres);
  });
};

exports.getMethodMeta = function(req, res){
  var GroupByMethod = {query:{jvm_name: req.params.jvm_id}};
  GroupByMethod.map = function() {
    var classname, method, method_desc_terms, str_thread_id, thread_info;
    if ((this.method_desc != null)) {
      method_desc_terms = this.method_desc.split('#');
      classname = method_desc_terms[0];
      method = {};
      thread_info = {};
      str_thread_id = this.thread_id + "";
      thread_info[str_thread_id] = 1;
      method[method_desc_terms[1]] = {
        count: 1,
        thread_info: thread_info
      };
      emit(classname, method);
    }
  };

  GroupByMethod.reduce = function(classname, methods) {
    var count, i, len, method, method_info, method_name, ref, result, thread_id;
    result = {};
    for (i = 0, len = methods.length; i < len; i++) {
      method = methods[i];
      for (method_name in method) {
        method_info = method[method_name];
        if ((result[method_name] != null)) {
          result[method_name].count += method_info.count;
          ref = method_info.thread_info;
          for (thread_id in ref) {
            count = ref[thread_id];
            if ((result[method_name].thread_info[thread_id] != null)) {
              result[method_name].thread_info[thread_id] += count;
            } else {
              result[method_name].thread_info[thread_id] = count;
            }
          }
        } else {
          result[method_name] = method_info;
        }
      }
    }
    return result;
  };
  Trace.mapReduce(GroupByMethod, function(err, dbres) {
    res.json(dbres);
  });
};


