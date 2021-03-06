var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var test = require('./routes/test');
var stockBasic = require('./routes/stockBasicInformationController');
var analysis = require('./routes/analysis');

var JobService = require("./service/JobService");
var StockDetailFetchService = require("./service/StockDetailFetchService");
var analysisService = require("./service/stockDetail/strategyService");
 
var localLogger = require("./service/LogService");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/test', test);
app.use('/stockBasic', stockBasic);
app.use('/analysis', analysis);
/*
  Job Block
  
*/

var CronJob = require('cron').CronJob;
new CronJob('00 20 15 * * 1-5', function() {
  var jobService = new JobService();
  jobService.createJob(2, function(err, jobId){
    if(err){
    } else {
      StockDetailFetchService.fetchDetail(jobId);
    }
  }, "Daily Job fetching");
}, null, true, 'Asia/Shanghai');

new CronJob('00 00 17 * * 1-5', function() {
  var jobService = new JobService();
  jobService.createJob(3, function(err, jobId){
    if(err){
    } else {
      analysisService.runStrategy(jobId);
    }
  }, "daily analysis for each strategy");
}, null, true, 'Asia/Shanghai');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
