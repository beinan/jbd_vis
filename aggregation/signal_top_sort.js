var mongoose = require('mongoose');

var Promise = require('es6-promise').Promise;

var Signal = require('../models/Signal.js');

exports.signalTopSort = function(jvm_name){
  return buildEdges(jvm_name).then(function(count){
    var p = new Promise(function(resolve, reject){
      topSortReduce(jvm_name, resolve, reject, 0);       
      //resolve(count);
    });
    return p.then(
      function(reduce_count){
        return {signal_count: count, reduce_count: reduce_count};
      }
    );
  });
};

function topSortReduce(jvm_name, resolve, reject, count){
  console.log("top sort reduce:", count);
  Signal.findOneAndUpdate({jvm_name: jvm_name, incomming_edges:[], seq:{$exists:false}}, {$set: {seq: count + 1}}).exec(
    function(err,doc){
      if(doc){
        Signal.update({incomming_edges: doc._id}, {$pull: {incomming_edges: doc._id}}, { multi: true })
          .exec(function(err, res){
            if(err) reject(err);
            topSortReduce(jvm_name, resolve, reject, count + 1);
          });
      } else {
        resolve(count);
      }
    }
  );
}     
function buildEdges(jvm_name){
  
  console.log("top sort start");
  var stream = Signal.find({_id: {"$regex": "^" + jvm_name}}).stream();
  var counter = 0;
  var promise = new Promise(
    function(resolve, reject) {
      stream.on('data', function (doc) {    
        counter++;
        this.pause();
        var self = this;
        console.log("signal loaded", doc);
        findIncomingEdge(doc).then(
          function(edges){
            console.log(edges);
            //if(doc.thread_id !== edges[0][0].thread_id)
            edges = edges
              .filter(function(edge){return edge.length > 0;})
              .map(function(edge) {return edge[0]._id;});
            console.log("incomming edge",doc._id, edges);
            Signal.update({_id:doc._id}, {$set: {incomming_edges: edges}})
              .exec(
                function(err,res){
                  console.log("update incomming edges",err, res);
                  self.resume();
                }
              );
          } 
          
        ).catch(function(err){
          throw err;
        });
      }).on('error', function (err) {
        console.log("error during signal topological sort", err);
        reject(err);
      }).on('close', function () {
        resolve(counter);        
      });

    }
  );
  return promise;
};

function findIncomingEdge(doc){
  var promises = [];
  var p1 = query({jvm_name:doc.jvm_name, thread_id: doc.thread_id, invocation_id:{$lt:doc.invocation_id}},
                 {invocation_id:-1}, 1);
  promises.push(p1);
  console.log(doc.signal_type);
  var q;
  if(doc.signal_type == "field_setter"){
    q = {jvm_name:doc.jvm_name, field: doc.field, signal_type: "field_setter", version: {$lt:doc.version}};
    if(doc.owner_ref)
      q.owner_ref = doc.owner_ref;
    console.log(q);
    var p2 = query(q, {version:-1}, 1);
    promises.push(p2);
  }else if(doc.signal_type == "field_getter"){
    q = {jvm_name:doc.jvm_name, field: doc.field, signal_type: "field_setter", version: doc.version};
    if(doc.owner_ref)
      q.owner_ref = doc.owner_ref;
    var p3 = query(q, {}, 1);
    promises.push(p3);    
  }

  return Promise.all(promises);
}

function query(q,orderBy,limit){
  return new Promise(
    function(resolve, reject){
      Signal.find(q).sort(orderBy).limit(limit).exec(
        function(err, docs){
          if(err){
//            console.log("query error", err, q);
            reject(err);
          } else {
//            console.log("found docs",docs);
            resolve(docs);
          }
        }
      );
    }
  );
}


