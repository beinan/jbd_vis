var mongoose = require('mongoose');

var sourceFileSchema = new mongoose.Schema({
  jvm_id: String,
  file_name: String,
  classes: [String],            
  source: String,
  ast: mongoose.Schema.Types.Mixed

});

var SourceFile = mongoose.model('SourceFile', sourceFileSchema);
module.exports = SourceFile;

