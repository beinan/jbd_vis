var mongoose = require('mongoose');

var signalSchema = new mongoose.Schema({
  _id: String,
  from_id: String,
  jvm_name: String,            
  signal_type: String,
  value: String,
  parent_invocation_id: Number,
  version: Number,
  field: String,
  index: Number,
  owner_ref: Number,
  line_number: Number,  
  thread_id: Number,
  invocation_id: Number,
  invokee_id: Number, //for method return value
  method_desc: String,
  incomming_edges: [String],
  seq: Number,
  args: [String],
  created_datetime: Date
});

var Signal = mongoose.model('Signal', signalSchema);
module.exports = Signal;
