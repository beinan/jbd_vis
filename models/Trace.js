var mongoose = require('mongoose');

var traceSchema = new mongoose.Schema({
  method_desc: String,
  onwer_ref: Number,
  jvm_name: String,
  thread_id: Number,
  invocation_id: Number,
  msg_type: String,
  parent_invocation_id: Number,
  field: String,
  index:Number,
  line_number: Number,
  owner_ref: Number,
  version: Number,
  value: String,
  arg_seq:Number,
  created_datetime: Date
}, {collection: 'trace'});

var Trace = mongoose.model('Trace', traceSchema);
module.exports = Trace;
