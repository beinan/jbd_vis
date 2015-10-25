var path = require('path');
var fsp = require('../utils/fs_promise.js');
var moment = require('moment');
var exec = require('../utils/shell_promise.js').exec;
var UserApp = require('../models/UserApp');
var JvmProcess = require('../models/JvmProcess');

exports.upload = function(req, res) {
  console.log(req.file);
  var appDir = path.dirname(require.main.filename);    
 
  var date_folder = moment().format('YYYYMMDD_HHmmss');
  var dest_folder = path.join(appDir, "uploads", date_folder);
  var final_filename = path.join(dest_folder, req.file.originalname);
  fsp.mkdirp(dest_folder)
    .then(fsp.move.bind(null, req.file.path, final_filename))
    .then(fsp.copy.bind(null, '/home/bwang19/jbd/agent/target/scala-2.10/jbd-agent.jar', path.join(dest_folder, 'jbd-agent.jar')))
    .then(build.bind(null, dest_folder, final_filename))
    .then(parse.bind(null, dest_folder))
    .then(function(data){
      res.json({msg:'Build successfully.', data:data});
    });
 
  
};

function build(dest_folder, filename){
  var extname = path.extname(filename);
  console.log("extname:", extname);
  if(extname == ".java")
    return exec("javac *.java", {cwd:dest_folder});
  else if(extname == '.zip')
    return fsp.unzip(filename, dest_folder).then(exec.bind(null, 'javac -sourcepath src -d . ./**/*.java', {cwd:dest_folder}));
  else
    throw "unsupported file type.";
  
}

function parse(folder){
  return fsp.walk(folder).then(function(file_list){
    var parse_promises =  file_list.filter(function(filename){
      return path.extname(filename) == '.java';
    }).map(function(filename){
      return exec("/home/bwang19/java_ast2json/target/universal/stage/bin/java_ast2json " + filename);
    });
    return Promise.all(parse_promises).then(function(data){
      return UserApp.createUserApp(folder).then(function(user_app){ //create a user app object in mongodb
        var main_classes = [];
        data.forEach(function(d){
          var json = JSON.parse(d);
          //console.log(json.types);
          var package_name = json.package?json.package+".":"";
          json.types.forEach(function(t){
            console.log(t.name);
            t.members.forEach(function(m){
              //console.log(m);
              if(m.name == "main" && m.modifiers==9){
                //public static main function
                main_classes.push(package_name + t.name);
              }
            });
          });
        });
        return {app_id: user_app._id, main_classes:main_classes};
      });
    });
  });
}
exports.run = function(req, res){
  UserApp.findOne({_id:req.query.app_id},function(err, app){
    JvmProcess.createJvmProcess(req.query.main_class_name, app._id).then(function(jvm){
o      //var jvm_id = app._id + "_" + moment().format('YYYYMMDDHHmmss');
      exec(" docker run --name jdevv-exec --link jd-mongo:db -e \"jvm_id=" + jvm._id + "\" -v " + app.folder+ ":/data jdevv java -javaagent:jbd-agent.jar " + jvm.main_class);
      res.json({msg:'Execution starts'});
    }).catch(console.log);
    
  });
  
}
