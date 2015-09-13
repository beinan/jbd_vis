var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var compress = require('compression');
var connectAssets = require('connect-assets');
var logger = require('morgan');
var bodyParser = require('body-parser');


var app = express();


app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));

app.use(bodyParser.json());

app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


mongoose.connect(process.env.MONGODB || 'mongodb://localhost:27017/jbd');
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
app.get('/api/parse_java/', java_source.parse);


/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;


