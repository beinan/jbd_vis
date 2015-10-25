var mongoose = require('mongoose');

var Promise = require('es6-promise').Promise;
var assign = require('object-assign');

var Trace = require('../models/Trace.js');
var Actor = require('../models/Actor.js');
var Lifeline = require('../models/Lifeline.js');
var Signal = require('../models/Signal.js');

var SeqBuilder = require('../models/SeqBuilder.js');



//es6 promise wrapper for mongoose query
function promise_wrapper(mongoose_query){
  return new Promise(
    function(resolve, reject){
      mongoose_query.exec(
        function(err, result){
          if(err)
            reject(err);
          else
            resolve(result);
        }
      );
    }
  );
}

exports.createSeqDiagram = function(jvm_name, selected_classes){
  var actor_q = {jvm_name : jvm_name};
  actor_q['$or'] = selected_classes.map(function(class_name){
    return {owner: class_name};  //select by class name
  });
  console.log(actor_q);
  var actor_q_promise = promise_wrapper(Actor.find(actor_q));
  
  var signal_q = {jvm_name: jvm_name, signal_type:"method_invoke"};
  signal_q['$or'] = selected_classes.map(function(class_name){
    return {method_desc: {$regex: "^" + class_name}};  //select by class name
  });
  console.log(JSON.stringify(signal_q));
  var signal_q_promise = promise_wrapper(Signal.find(signal_q).sort({seq:1}));

  var lifeline_q = {};
  lifeline_q['$or'] = selected_classes.map(function(class_name){
    return {_id: {$regex: "^" + jvm_name + ':' + class_name}};  //select by class name
  });
  console.log(JSON.stringify(lifeline_q));
  var lifeline_q_promise = promise_wrapper(Lifeline.find(lifeline_q).sort({seq:1}));

  var promises = [actor_q_promise, signal_q_promise, lifeline_q_promise];
  return Promise.all(promises).then(function(data){
    return {
      actors: data[0],
      signals: data[1],
      lifelines: data[2]
    };
  });
}

exports.buildActorAndSignals = function(jvm_name, selected_classes){
  //console.log(SeqBuilder.createBuilder);
  return SeqBuilder.createBuilder(jvm_name).then(function(builder){
    console.log(builder);
    if(builder.status == "processing")
      throw "Builder is processing. Please wait.";
    //console.log("startBuilding function", builder.startBuilding);
    return builder.startBuilding(selected_classes, naive_build);
  });

};

function naive_build(builder){
  var q = {jvm_name : builder.jvm_name, msg_type:'method_enter'};
  q['$or'] = builder.selected_classes.map(function(class_name){
    return {method_desc: {$regex: "^"+class_name}};  //select by class name
  });
  var stream = Trace.find(q).stream();
  var counter = 0;
  var promise = new Promise(
    function(resolve, reject) {
      stream.on('data', function (doc) {    
        counter++;
        this.pause();
        //console.log(doc._doc);
        var data = parsingTraceData(doc);
        //console.log(data);
        var self = this;
        Actor.createActorAndLifeline(data).then(function(p){
          //console.log("promise return", p);
          var from_actor = p[0];
          var from_lifeline = p[1];
          var f_p = createOutSignals(from_actor, from_lifeline);
          f_p.then(function(){
            self.resume();
          });
        }).catch(function(err){
          console.log(err);
        });
      }).on('error', function (err) {
        console.log("error during build actor and signals streaming", err);
        reject(err);
      }).on('close', function () {
        var top_sort = require('../aggregation/signal_top_sort').signalTopSort;
        top_sort(builder.jvm_name).then(function(){
          resolve(counter);        
        });
      });

    }
  );
  return promise;
};

function parsingTraceData(trace_doc){
  //console.log(trace_doc);
  var method_descs = trace_doc.method_desc.split('#');
  var more = {};
  more.owner = method_descs[0];
  more.method = method_descs[1].split('(')[0] + "()";
  //console.log(more);
  return assign(more, trace_doc._doc);
}


function createOutSignals(from_actor, from_lifeline) {
  var stream = Trace.find({
    jvm_name:from_actor.jvm_name,
    parent_invocation_id: from_lifeline.invocation_id,
    thread_id: from_lifeline.thread_id,
    msg_type: {$in:["field_setter", "field_getter", "method_invoke"]}
    
  }).stream();
  //console.log("from lifeline", from_lifeline);
  var counter = 0;
  var promise = new Promise(
    function(resolve, reject) {
      stream.on('data', function (data) {
        counter ++;
//        console.log("out signals tracing data",data);
        var signal_id = from_actor.jvm_name + ':' + data.thread_id + ":" + data.invocation_id;
        var signal_type = data.msg_type;
        var new_signal = {
          jvm_name: from_actor.jvm_name,
          from_id: from_lifeline._id,
          thread_id: data.thread_id,
          invocation_id: data.invocation_id,
          signal_type: data.msg_type,
          parent_invocation_id: data.parent_invocation_id
        };
        if(data.owner_ref){
          new_signal.onwer_ref = data.owner_ref;
        }
        if(signal_type === "field_getter" || signal_type==="field_setter"){
          new_signal.value = data.value;
          new_signal.version = data.version;
          new_signal.field = data.field;
          //new_signal.line_number = data.line_number;
        } else {
          new_signal.method_desc = data.method_desc;
        }
        if(data.line_number)
          new_signal.line_number = data.line_number;
        //console.log("signal data", new_signal);
        var s_p = Signal.findOneAndUpdate({_id:signal_id}, {$set: new_signal}, {upsert:true, new:true})
          .exec()
          .then(
            function(doc){
              //console.log("findOneAndUpdate or create a signal:", doc);
            },
            function(err){
              console.log(err);
              throw err;
            }
          );
          

      }).on('error', function (err) {
        console.log("error during build actor and signals streaming", err);
        reject(err);
      }).on('close', function () {
        resolve(counter);        
      });

    }
  );
  return promise;
  
}



