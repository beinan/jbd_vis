var mongoose = require('mongoose');

var sourceFileSchema = new mongoose.Schema({
  user_app:{ type: mongoose.Schema.Types.ObjectId, ref: 'UserApp' },
  //filename: String,
  types: [String],            
  source: [String],
  ast: mongoose.Schema.Types.Mixed

});

var SourceFile = mongoose.model('SourceFile', sourceFileSchema);
module.exports = SourceFile;

