var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var unzip = require('unzip');
var Promise = require('es6-promise').Promise;


exports.mkdirp = function(path){
  return new Promise(
    function(resolve, reject){ 
      mkdirp(path, function (err) {
         console.log("create folder", path);
         if (err) return reject(err);
         return resolve();
      });
    }                  
  );
};

exports.move = function(src_name, dest_name){
  return new Promise(
    function(resolve, reject){
      fs.rename(src_name, dest_name, function (err) {
        console.log("rename", src_name, dest_name);
        
        if (err) return reject(err);
        return resolve();
      });
    }                  
  );
};

exports.copy = function(source, target) {
  return new Promise(
    function(resolve, reject){
      var rd = fs.createReadStream(source);
      rd.on("error", function(err) {
        reject(err);
      });
      var wr = fs.createWriteStream(target);
      wr.on("error", function(err) {
        reject(err);
      });
      wr.on("close", function(ex) {
        resolve();
      });
      rd.pipe(wr);  
    }
  );
  
}
exports.unzip = function(zip_filename, dest_folder){
  return new Promise(
    function(resolve, reject){
      fs.createReadStream(zip_filename)
        .pipe(unzip.Extract({path: dest_folder}))
        .on('error', function(err){
          console.log(err);
          reject(err);
        })
        .on('close', function(){
          resolve();
        });
    }    
  );
}


exports.readFile = function(filename){
  return new Promise(
    function(resolve, reject){
      fs.readFile(filename, "utf-8", function(err, data){
        if(err)
          reject(err);
        else
          resolve(data);
      });
    }
  );
  
}


exports.walk = function(dir) {
  return new Promise(
    function(resolve, reject){
      var results = [];
      var q = [dir];
      var i = 0;
      (function next() {
        var file = q[i++];
        if (!file) {
          resolve(results);
          return;
        }        
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            fs.readdir(file, function(err, files) {
              files.forEach(function(file_in_dir){
                q.push(path.join(file, file_in_dir));
              });
              next();
            });
          } else {
            results.push(file);
            next();
          }
        });
      })();
      
    }
  );
  
};
