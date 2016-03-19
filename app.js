var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var compress = require('compression');
var connectAssets = require('connect-assets');
var logger = require('morgan');
var bodyParser = require('body-parser');

var multer  = require('multer');

var app = express();


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));

app.use(bodyParser.json());
var upload = multer({ dest: 'uploads/' });



app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


mongoose.connect(process.env.MONGODB || 'mongodb://localhost:28888/jbd');
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

/*single page application*/
app.get('/', function (req, res) {
  res.render('home');
});

var trace = require('./controllers/trace');
var diagram = require('./controllers/diagram');
var java_source = require('./controllers/java_source');

app.get('/api/jvms', trace.getJvms);
app.get('/api/methods_meta/:jvm_id', trace.getMethodMeta);
app.post('/api/build_seq_diag/', trace.buildSeqDiag);
app.post('/api/get_seq_diag/', diagram.getSeqDiag);
app.get('/api/get_method_invocation_info/', diagram.getMethodInvocationInfo);
app.get('/api/get_next_signals/', diagram.getNextSignals);
//app.get('/api/get_source/', java_source.source);
app.get('/api/signal_code_detail/:signal_id', java_source.signal_code_detail);
app.post('/api/field_monitor', java_source.field_monitor);

app.get('/api/source_line_detail/:source_file/:jvm_id/:line_number', java_source.source_line_detail);

app.post('/upload', upload.single('file'), java_source.upload);

app.get('/run', java_source.run);
app.get('/fetch_git', java_source.fetch_git);
app.get('/obj_detail', java_source.obj_detail);

app.post('/fields_history_value', java_source.fields_history_value);
/**
 * Start Express server.
 */
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

server.timeout = 1000000;
module.exports = app;


