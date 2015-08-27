var mongoose = require('mongoose');

var actorSchema = new mongoose.Schema({
  _id: String,
  jvm_name: String,
  owner: String,
  owner_ref: String
});

var Actor = mongoose.model('Actor', actorSchema);
module.exports = Actor;
