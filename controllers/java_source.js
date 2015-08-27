var shell = require('shelljs');


exports.parse = function(req, res) {
  res.charset = res.charset || 'utf-8';
  set('Content-Type', 'application/json');
  var filename = "/home/bwang19/jbd/tracing/src/test/java/samples/concurrent/Plant.java";
  var process = shell.exec("/home/bwang19/java_ast2json/target/universal/stage/bin/java_ast2json " + filename, {async:true});
  process.stdout.pipe(res);
};
