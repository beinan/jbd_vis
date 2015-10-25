var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;

var userAppSchema = new mongoose.Schema({
  folder: String
  
});

userAppSchema.statics.createUserApp = function(folder) {
  var this_model = this;
  return new Promise(function(resolve, reject){
    console.log("create", this_model.create);
    
    this_model.create({folder:folder}, function(err, app){
        if(err){
          reject(err);
        } else {
          resolve(app);
        }
      });

  });
};

var UserApp = mongoose.model('UserApp', userAppSchema);
module.exports = UserApp;

