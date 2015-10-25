var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;

var jvmProcessSchema = new mongoose.Schema({
  user_app:{ type: mongoose.Schema.Types.ObjectId, ref: 'UserApp' },
  main_class:String
  
});

jvmProcessSchema.statics.createJvmProcess = function(main_class, user_app_id) {
  var this_model = this;
  return new Promise(function(resolve, reject){
    //console.log("create", this_model.create);
    
    this_model.create({main_class:main_class, user_app: user_app_id}, function(err, jvm){
        if(err){
          reject(err);
        } else {
          resolve(jvm);
        }
      });

  });
};

var JvmProcess = mongoose.model('JvmProcess', jvmProcessSchema);
module.exports = JvmProcess;

