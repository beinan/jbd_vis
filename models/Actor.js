var mongoose = require('mongoose');

var actorSchema = new mongoose.Schema({
  _id: String,
  jvm_name: String,
  owner: String,
  owner_ref: String
});



var Lifeline = require('./Lifeline.js');
actorSchema.statics.createActorAndLifeline = function(data){
  var actor_id = data.jvm_name + ":" + data.owner;
  if(data.owner_ref)
    actor_id = actor_id + ":" + data.owner_ref;
  else
    actor_id = actor_id + ":" + "static";
  //duplicated actor will be merged
  var new_actor = {jvm_name: data.jvm_name, owner: data.owner, owner_ref: data.owner_ref};
  var a_p = Actor.findOneAndUpdate({_id:actor_id}, {$set: new_actor}, {upsert:true, new:true})
    .exec();
  //create a lifeline for this method enry
  //duplicated lifeiline will be merged
  var lifeline_id = actor_id+ ":" + data.thread_id + ":" +  data.invocation_id;
  var new_lifeline = {method_name: data.method, thread_id:data.thread_id, invocation_id: data.invocation_id };
  var l_p = Lifeline.findOneAndUpdate({_id:lifeline_id}, {$set: new_lifeline}, {upsert:true, new:true})
    .exec();
  return Promise.all([a_p, l_p]);
}

var Actor = mongoose.model('Actor', actorSchema);

module.exports = Actor;
