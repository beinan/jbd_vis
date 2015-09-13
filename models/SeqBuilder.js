var mongoose = require('mongoose');
var Promise = require('es6-promise').Promise;


var seqBuilderSchema = new mongoose.Schema({
  jvm_name: String,
  selected_classes: [String],
  status: String  
});


seqBuilderSchema.statics.createBuilder = function (jvm_name) {
  this_model = this;
  return new Promise(function(resolve, reject){
    //console.log("findOneAndUpdate", this_model.findOneAndUpdate);
    this_model.findOneAndUpdate({jvm_name:jvm_name}, {$set: {status:'new'}}, {upsert:true, new:true})
      .exec(function(err, builder){
        if(err){
          reject(err);
        } else {
          resolve(builder);
        }
      });

  });
};




seqBuilderSchema.methods.startBuilding = function(selected_classes, build_func){
  this_doc = this;
  return new Promise(function(resolve, reject){
    this_doc.statue = "processing";
    this_doc.selected_classes = selected_classes;
    this_doc.save(function(err){
      if(err){
        reject(err);
      }else{
        build_func(this_doc).then(function(result){
          this_doc.status= "ready";
          this_doc.save(function(err){
            if(err)
              reject(err);
            else
              resolve(result);
          });
        }); 
      }
    });
  });
};


var SeqBuilder = mongoose.model('SeqBuilder', seqBuilderSchema);

module.exports = SeqBuilder;
