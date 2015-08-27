var mongoose = require('mongoose');

var lifelineSchema = new mongoose.Schema({
  _id: String,
  jvm_name: String,
  method_name: String,
  thread_id: Number,
  invocation_id: Number
});

var Lifeline = mongoose.model('Lifeline', lifelineSchema);
module.exports = Lifeline;
