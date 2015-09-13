var mongoose = require('mongoose');

var Trace = require('../models/Trace.js');

var Signal = require('../models/Signal.js');
var createSeqDiagram = require('../aggregation/build_seq_diag').createSeqDiagram;

var Promise = require('es6-promise').Promise;


exports.getSeqDiag = function(req, res){
  createSeqDiagram(req.body.id, req.body.selected_classes).then(
    function(diagram_data){
      res.json({status:"finished", data:diagram_data});
    }    
  ).catch(function(err){
    res.status(500).json(err);
  });  
  
};

exports.getMethodInvocationInfo = function(req, res){
  var from_lifeline_id = req.query.from_lifeline_id;
  var from_lifeline_data = from_lifeline_id.split(':');
  Promise.all(
    [
      queryOutSignals(from_lifeline_id),
      getParams(from_lifeline_data[0], from_lifeline_data[3], from_lifeline_data[4])
    ]).then(function(data){
    res.json(
      {
        out_signals: data[0],
        params: data[1]
      }
    );
  });
};

function queryOutSignals(from_lifeline_id){
  return new Promise(function(resolve, reject){
    Signal.find({from_id: from_lifeline_id}).sort({seq:1}).exec(function(err, docs){
      if(err)
        return reject(err);
      return resolve(docs);
    });
  });

}

exports.getNextSignals = function(req, res){
  var start_seq = req.query.start_seq;
  queryNextSignals(start_seq).then(res.json.bind(res))
    .catch((e) => res.status(500).json(e));
};

function queryNextSignals(seq){
  return new Promise(function(resolve, reject){
    Signal.find({seq: {$gt: seq}}).sort({seq:1}).exec(function(err, docs){
      //oconsole.log("signals", docs);
      if(err)
        return reject(err);
      return resolve(docs);
    });
  });
}

function getParams(jvm_name, thread_id, invocation_id){
  return new Promise(function(resolve, reject){

    Trace.find({jvm_name:jvm_name, thread_id:thread_id, invocation_id: invocation_id, msg_type:'method_argument'})
      .sort({arg_seq:1}).exec(function(err, docs){
        if(err)
          return reject(err);
        return resolve(docs);
      });
  });
}
