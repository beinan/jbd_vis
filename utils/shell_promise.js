var Promise = require('es6-promise').Promise;
var exec = require('child_process').exec;

exports.exec = function(cmd, options){
  options = options?options:{};
  return new Promise(
    function(resolve, reject){
      var output = '';
      console.log("start exec command", cmd, options);
      var killed = false;
      var timeout_id = setTimeout(function(){
        //kill and remove all existing docker containers
        exec("docker kill $(docker ps -q -f name=jdevv-exec) ; docker rm $(docker ps -a -q -f name=jdevv-exec)");
        resolve({err_msg:"Time out", output: output}); //timeout 
      }, (options.timeout>0?options.timeout:60000));

      var child_process = exec(cmd, options, function (err) {
        console.log("finish command", cmd, options, err);
        exec("docker kill $(docker ps -q -f name=jdevv-exec) ; docker rm $(docker ps -a -q -f name=jdevv-exec)");
        if (err) {
           return reject(output);
         }
         return resolve(output);
      });

      child_process.stdout.on('data', function(data) {
        output += data;
        
      });

      child_process.stderr.on('data', function(data) {
        output += data;
      });
    }                  
  );
};
