var path = require('path');
var fsp = require('../utils/fs_promise.js');
var moment = require('moment');
var exec = require('../utils/shell_promise.js').exec;
var execDocker = require('../utils/shell_promise.js').execDocker;
var UserApp = require('../models/UserApp');
var JvmProcess = require('../models/JvmProcess');
var SourceFile = require('../models/SourceFile');
var Signal=require('../models/Signal');
var Trace=require('../models/Trace');

var Promise = require('es6-promise').Promise;

var type_map = {
  I: 'int',
  Z: 'bool',
  B: 'byte',
  J: 'long',
  F: 'float',
  D: 'double',
  C: 'char',
  L: 'class'
};
exports.obj_detail = function(req, res){
  console.log(req.query.obj_ref);
  Signal.aggregate(
    [{$match:{jvm_name: req.query.jvm_name, owner_ref:parseInt(req.query.obj_ref)}},
    {$group:{_id:"$field"}}], 
    function(err, signals){
    //console.log(signals);
      var fields = signals.map(function(s){
        var id = s._id;
        var class_name = id.split('@')[0];
        var field_name = id.split('@')[1].split(',')[0];
        var field_type = id.split(',')[1];
        return {field_id:s._id, class_name:class_name, field_name:field_name, field_type:type_map[field_type]};
      });
      console.log(fields);
      res.json({fields:fields});
  });
  //console.log(req.file);
  
}
exports.source_line_detail = function(req, res){
  var line_number = req.params.line_number;
  SourceFile.findOne({_id:req.params.source_file}, function(err, source_file){
    if(err){
      console.log('query source error',err);
      reject(err);
    }else{
      //console.log("source file", source_file);
      var package_name = source_file.ast.package? source_file.ast.package + ".":"";
      
      for(var t of source_file.ast.types){
        for(var m of t.members){
          //console.log("m pos", m.pos, line_number);
          if( m.pos && m.pos.begin_line < line_number && m.pos.end_line > line_number){
            var class_name = package_name + t.name;
            var method_desc = class_name + "#" + m.name;
            console.log("matched method:", method_desc);
            Trace.find({method_desc:{$regex:'^' + method_desc}, msg_type:'method_enter'}, {invocation_id:1},function(err, traces){
              //console.log(traces);
              var parent_ids = traces.map((t) => t.invocation_id);
              console.log(parent_ids);
              Signal.find({parent_invocation_id:{$in:parent_ids}, line_number:line_number}).sort({seq:1}).exec(function(err, signals){
                //console.log("singals", err, signals);
                var result = {};
                signals.forEach((s)=> {
                  if(!result[s.thread_id]){
                    result[s.thread_id] = {};
                  }
                  if(!result[s.thread_id][s.parent_invocation_id]){
                    result[s.thread_id][s.parent_invocation_id] = [];
                  }
                  result[s.thread_id][s.parent_invocation_id].push(s);
                });
                //console.log(result);
                res.json({data:result});
              });
              
            });
            return;
          }
        }
      } //there should be only one method matched.
      
      
    }
  });

};


exports.field_monitor = function(req, res){
  console.log("monitor", req.body);
  var jvm_name = req.body.jvm_id;
  var seq = req.body.seq;
  var promises = req.body.fields.map((f)=>{
    return new Promise(
      function(resolve, reject){
        var query = Signal.find({
          jvm_name: jvm_name, 
          seq: {$lte: seq}, 
          field:f, 
          signal_type:{$in:['field_getter', 'field_setter']}
        }).sort({seq: -1}).limit(1);
        query.exec(function(err, doc){
          if(err){
            reject(err);
          }
          else{
            if(doc && doc[0])
              resolve({field: f, value: doc[0].value});
            else
              resolve(null);
          }
          
        });
      });
  });
  Promise.all(promises).then(function(data){
    var map = {};
    data.forEach(
      (d)=>{
        if(d){
          map[d.field] = d.value;
        }
    });
    console.log('monitor data', map);
    res.json({data:map});
  });
  
};

exports.fields_history_value = function(req, res){
  console.log("field_history_value", req.body);
  var jvm_name = req.body.jvm_name;
  var seq = 0;
  var promises = req.body.fields.filter((d)=>{return d.active;}).map((f)=>{
    return new Promise(
      function(resolve, reject){
        var query = Signal.find({
          jvm_name: jvm_name,
          owner_ref: req.body.obj_ref,
          field:f.field_id, 
          signal_type:{$in:['field_getter', 'field_setter']}
        }).sort({seq: 1});
        query.exec(function(err, doc){
          if(err){
            reject(err);
          }
          else{
            
            resolve({field: f.field_name, values: doc});
            
          }
          
        });
      });
  });
  Promise.all(promises).then(function(data){
    var rows = [];
    var columns = [['number','Seq']];
    data.forEach(
      (d, c)=>{
        columns[c+1] = ['number',d.field];
        var i = 0;
        var value = 0;
        d.values.forEach((s) => {
          while(i < s.seq){
            if(!rows[i])
              rows[i] = [i];
            rows[i][c+1] = value;
            i++;  
          }
          value = parseFloat(s.value);
        });
        
    });
    for(var r = 0; r < rows.length; r++)
      for(var c = 1; c < columns.length; c++){
        //console.log(rows[r]);
        if(rows[r][c] === undefined)
          rows[r][c] = rows[r-1][c];
      }
    console.log('monitor data', rows);
    res.json({rows:rows, columns:columns});
  }).catch(console.log);
  
}

//get related values of the signal passedin, also mapping the values to the source code.
exports.signal_code_detail = function(req,res){
  var signal_id = req.params.signal_id;
  Signal.findOne({_id:signal_id}, function(err, signal){
    get_method_invocation_detail(signal.jvm_name, signal.thread_id, signal.parent_invocation_id)
      .then(function(parent_invocation){
        return get_source(signal, parent_invocation);
    }).then(map_values)
      .then(function(data_returned){
      //console.log(data_returned);
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
                  {
                   jvm_name:signal.jvm_name,
                   invocation_id:t.invocation_id, value:t.value, thread_id: t.thread_id, 
                   field_original: t.field, 
                   field: t.field.split(',')[0].split('@')[1], 
                   owner_ref: t.owner_ref,
                   owner: t.owner_ref?"obj":t.field.split(',')[0].split('@')[0],
                   datetime:t.created_datetime,
                   op:'read'}); 
              }else if(t.msg_type=='field_setter'){
                console.log("setter:", t);
                data.values[t.line_number].push(
                  {
                    jvm_name:signal.jvm_name,
                    invocation_id:t.invocation_id, value:t.value, thread_id: t.thread_id, 
                    field_original: t.field, 
                    field: t.field.split(',')[0].split('@')[1], 
                    owner_ref: t.owner_ref,
                    owner: t.owner_ref?"obj":t.field.split(',')[0].split('@')[0],
                    datetime:t.created_datetime,
                    op:'write'});
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
          //console.log(data.values);
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
          var class_name = parent.class_name.split('/').join('.');
          SourceFile.findOne({user_app:jvm.user_app, types:class_name}, function(err, source_file){
            if(err){
              console.log('query source error',err);
              reject(err);
            }else{
              console.log("source file", source_file, jvm, parent.class_name);
              var package_name = source_file.ast.package? source_file.ast.package + ".":"";
              var type = source_file.ast.types.filter((t)=>{return (package_name + t.name) == class_name;})[0];
              //console.log('type', type);
              var codes = [];
              var begin_line = 0;
              for(var i in type.members){
                //console.log(type.members[i], type.members[i].pos);
                var pos = type.members[i].pos;
                if(pos && signal.line_number >= pos.begin_line && signal.line_number <= pos.end_line){
                  //console.log("match pos", pos);
                  codes = source_file.source;//.slice(pos.begin_line - 1, pos.end_line);
                  //codes.shift();
                  parent.pos = pos;
                }
              }
              var data_returned = {signal:signal, parent:parent, codes:codes,source_file:source_file._id};
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
          //console.log('parent trace', method_traces);
          method_traces.forEach(function(t){
            if(t.msg_type=='method_enter'){
              method_invocation.class_name = t.method_desc.split('#')[0];
            }else if(t.msg_type=='method_argument'){
              method_invocation.args[t.arg_seq] = t.value;
            }
          });
          //console.log(method_invocation);
          resolve(method_invocation);
        }
      });//end trace find
    }
  );
}

exports.source =function(req, res){
  console.log(req.query);
};

exports.fetch_git = function(req, res){
  //console.log(req.query.uri);
  //console.log(req.file);
  var appDir = path.dirname(require.main.filename);    
 
  var date_folder = moment().format('YYYYMMDD_HHmmss');
  var dest_folder = path.join(appDir, "uploads", date_folder);
  //var final_filename = path.join(dest_folder, req.file.originalname);
  fsp.mkdirp(dest_folder)
    //.then(fsp.move.bind(null, req.file.path, final_filename))
    .then(exec.bind(null, 'git clone ' + req.query.uri + ' proj', {cwd: dest_folder}))  //'proj' is the local folder name
    .then(exec.bind(null, 'javac -d . $(find ./src/* | grep .java)', {cwd:dest_folder + "/proj"}))
    .then(fsp.copy.bind(null, '/home/bwang19/jbd/agent/target/scala-2.10/jbd-agent.jar'
                        , path.join(dest_folder, "/proj",'jbd-agent.jar')))     
    .then(parse.bind(null, dest_folder + "/proj"))
    .then(function(data){
      res.json({msg:'Build successfully.', data:data});
    });
 
}
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
      execDocker(" docker run --name jdevv-exec --link jd-mongo:db -e \"jvm_id=" + jvm._id + "\" -v " + app.folder+ ":/data jdevv java -javaagent:jbd-agent.jar " + jvm.main_class);
      res.json({msg:'Execution starts'});
    }).catch(console.log);
    
  });
  
};
