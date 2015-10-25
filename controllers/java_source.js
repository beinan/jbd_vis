var path = require('path');
var fsp = require('../utils/fs_promise.js');
var moment = require('moment');

exports.upload = function(req, res) {
  console.log(req.file);
  var appDir = path.dirname(require.main.filename);    
 
  var date_folder = moment().format('YYYYMMDD_HHmmss');
  var dest_folder = path.join(appDir, "uploads", date_folder);
  var final_filename = path.join(dest_folder, req.file.originalname);
  fsp.mkdirp(dest_folder)
    .then(fsp.move.bind(null, req.file.path, final_filename))
    .then(fsp.copy.bind(null, '/home/bwang19/jbd/agent/target/scala-2.10/jbd-agent.jar', path.join(dest_folder, 'jbd-agent.jar')))
    .then(build.bind(null, final_filename))
    .then(function(){
      res.json({});
    });
 
  
};

function build(filename){
  return new Promise(
    function(resolve, reject){
      
    }
    
  );
}
exports.run = function(req, res){
  res.json({});
}
