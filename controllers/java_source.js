var path = require('path');
var fsp = require('../utils/fs_promise.js');
var moment = require('moment');
var exec = require('../utils/shell_promise.js').exec;
var UserApp = require('../models/UserApp');
var JvmProcess = require('../models/JvmProcess');
var SourceFile = require('../models/SourceFile');
var Signal=require('../models/Signal');
var Trace=require('../models/Trace');

var Promise = require('es6-promise').Promise;


//get related values of the signal passedin, also mapping the values to the source code.
exports.signal_code_detail = function(req,res){
  var signal_id = req.params.signal_id;
  Signal.findOne({_id:signal_id}, function(err, signal){
    get_method_invocation_detail(signal.jvm_name, signal.thread_id, signal.parent_invocation_id)
      .then(function(parent_invocation){
        return get_source(signal, parent_invocation);
    }).then(map_values)
      .then(function(data_returned){
      console.log(data_returned);
      res.json(data_returned);

    }).catch((e)=>res.json(e));
    
  });
};

function map_values(data){
  return new Promise(
    function(resolve,reject){
      data.values = {};
      data.parent.args.shift(); //remove the first element.
      data.values[data.parent.pos.begin_line] = [{op:'params', value:data.parent.args}];
      var signal = data.signal;
      //query all the trace from the parent method
      var trace_query = {jvm_name:signal.jvm_name, thread_id:signal.thread_id, parent_invocation_id:signal.parent_invocation_id};
      Trace.find(trace_query).sort({invocation_id:1}).exec(function(err, traces){
         if(err){
          console.log("query trace err",err);
          reject(err);
        }else{
          var further_query_promise = [];
          //console.log('traces', traces);
          traces.forEach(function(t){
            if(t.line_number){
              if(!data.values[t.line_number])
                data.values[t.line_number] = [];
              if(t.msg_type=='field_getter'){
                data.values[t.line_number].push(
                  {invocation_id:t.invocation_id, value:t.value, field: t.field.split(',')[0], op:'read'}); 
              }else if(t.msg_type=='field_setter'){
                data.values[t.line_number].push(
                  {invocation_id:t.invocation_id, value:t.value, field: t.field.split(',')[0], op:'write'});
              }else if(t.msg_type=="method_invoke"){
                var invoke_data = {invocation_id:t.invocation_id,op:'invoke',method:t.method_desc};
                data.values[t.line_number].push(invoke_data);
                further_query_promise.push(
                  get_method_invocation_detail(t.jvm_name,t.thread_id,t.invocation_id + 1).then(function(m){
                    m.args.shift();
                    invoke_data.params = m.args;
                  }));
              }

            }//end checking line number
          });
          
        }
        Promise.all(further_query_promise).then(()=>{
          console.log(data.values);
          resolve(data);
        });
        
      });//end trace find
      
    }
  );
}
function get_source(signal, parent){
  return new Promise(
    function(resolve, reject){
      JvmProcess.findOne({_id:signal.jvm_name}, function(err, jvm){
        if(err){
          console.log('query jvm error',err);
          reject(err);
        }else{
          SourceFile.findOne({user_app:jvm.user_app, types:parent.class_name}, function(err, source_file){
            if(err){
              console.log('query source error',err);
              reject(err);
            }else{
              //console.log("source file", source_file);
              var package_name = source_file.ast.package? source_file.ast.package + ".":"";
              var type = source_file.ast.types.filter((t)=>{return (package_name + t.name) == parent.class_name;})[0];
              //console.log('type', type);
              var codes = [];
              for(var i in type.members){
                //console.log(type.members[i], type.members[i].pos);
                var pos = type.members[i].pos;
                if(pos && signal.line_number >= pos.begin_line && signal.line_number <= pos.end_line){
                  console.log("match pos", pos);
                  codes = source_file.source.slice(pos.begin_line - 1, pos.end_line);
                  parent.pos = pos;
                }
              }
              var data_returned = {signal:signal, parent:parent, codes:codes};
              resolve(data_returned);

            }
          });
        }
      });
      
    }
  );
}

function get_method_invocation_detail(jvm_name, thread_id, invocation_id){
  return new Promise(
    function(resolve, reject){
       //query parent includes method_enter and method argument
      var method_query = {jvm_name:jvm_name, thread_id:thread_id, invocation_id:invocation_id};
      Trace.find(method_query, function(err, method_traces){
        var method_invocation = {args:[]};
        if(err){
          console.log("query parent err",err);
          reject(err);
        }else{
          console.log('parent trace', method_traces);
          method_traces.forEach(function(t){
            if(t.msg_type=='method_enter'){
              method_invocation.class_name = t.method_desc.split('#')[0];
            }else if(t.msg_type=='method_argument'){
              method_invocation.args[t.arg_seq] = t.value;
            }
          });
          console.log(method_invocation);
          resolve(method_invocation);
        }
      });//end trace find
    }
  );
}

exports.source =function(req, res){
  console.log(req.query);
};

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
      var read_file_p = fsp.readFile(filename);
      var parse_p = exec("/home/bwang19/java_ast2json/target/universal/stage/bin/java_ast2json " + filename);
      return Promise.all([read_file_p, parse_p]);
    });
    return Promise.all(parse_promises).then(function(data){
      return UserApp.createUserApp(folder).then(function(user_app){ //create a user app object in mongodb
        var main_classes = [];
        data.forEach(function(d){ //for each source file
          var lines = d[0].split('\n');
          var json = JSON.parse(d[1]);  //parse output from java_ast2json to a js object
          //console.log(json.types);
          
          var package_name = json.package?json.package+".":"";
          var types = [];  //class and interface in this source file.
          json.types.forEach(function(t){
            console.log(t.name);
            var class_name = package_name + t.name;  //classname with package name
             
            t.members.forEach(function(m){ //for each member, e.g. method and field
              //console.log(m);
               if(m.name == "main" && m.modifiers==9){
                //public static main function
                main_classes.push(class_name);
              }
            }); //for each member finished
            types.push(class_name);            
          });  //for each type finished
          SourceFile.create({user_app:user_app._id, source: lines, ast: json, types: types}, function(err, source){
            console.log("SourceFile instance in mongo created", err, source);
          });
          
        }); //for each file finished.
        return {app_id: user_app._id, main_classes:main_classes};
      });
    });
  });
}

exports.run = function(req, res){
  UserApp.findOne({_id:req.query.app_id},function(err, app){
    JvmProcess.createJvmProcess(req.query.main_class_name, app._id).then(function(jvm){
      //var jvm_id = app._id + "_" + moment().format('YYYYMMDDHHmmss');
      exec(" docker run --name jdevv-exec --link jd-mongo:db -e \"jvm_id=" + jvm._id + "\" -v " + app.folder+ ":/data jdevv java -javaagent:jbd-agent.jar " + jvm.main_class);
      res.json({msg:'Execution starts'});
    }).catch(console.log);
    
  });
  
};
