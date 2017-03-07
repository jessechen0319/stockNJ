var express = require('express');
var router = express.Router();
var dbService = require("../service/DBService");

var StockNameService = require("../service/StockNameService");
var stockNameService = new StockNameService();

var StockAnalysisService = require("../service/StockAnalysisService");
var stackAnalysisService = new StockAnalysisService();

var StockDetailFetchService = require("../service/StockDetailFetchService");
var JobService = require("../service/JobService");
/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.render('index', { title: 'Express' });
});

router.get('/manualInitFetch', function(req, res, next) {
	
	var jobService = new JobService();
	jobService.createJob(2, function(err, jobId){
		if(err){
		} else {
			StockDetailFetchService.fetchInit(jobId);
		}
	}, "initial Job fetching");
	res.end('initial fetch started');

});

router.get('/manualFetch', function(req, res, next) {
	
	var jobService = new JobService();
	jobService.createJob(2, function(err, jobId){
		if(err){
		} else {
			StockDetailFetchService.fetchDetail(jobId);
		}
	}, "Daily Job fetching");
	res.end('daily fetch started');

});

router.get('/getProcessRate', function(req, res, next) {

	var jobService = new JobService();
	jobService.createJob(2, function(err, jobId){
	  if(err){
	  } else {
	    StockDetailFetchService.fetchInit(jobId);
	  }
	}, "initial Job fetching");

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "processRate": processRate }));
    res.end();
});

router.get('/getDetailProcessRate', function(req, res, next) {

	var processRate = stockNameService.getDetailProcessRate(function(rate){
		
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "processRate": rate }));
	    res.end();
	});
});

router.post('/checkFetchDates', function(req, res, next) {

	if(req.body.dates){
		var dates = req.body.dates;
		var returnValue = [];
		dbService.readDb(function(err, db){
			dates.forEach(function(day){
				var dayObj = {};
				dayObj.date = day;
				if(db[day]){
					dayObj.valid = 'validate-success'
				} else {
					dayObj.valid = 'validate-fail'
				}
				returnValue.push(dayObj);
			});
			res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify(returnValue));
		    res.end();
		});
	} else {
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "status": false }));
	    res.end();
	}
});

router.get('/canoonThree', function(req, res, next) {

	stackAnalysisService.raiseCannonThree();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "result": "triggered" }));
    res.end();
});

router.get('/canoonThreeResult', function(req, res, next) {

	if(stackAnalysisService.anaylysisResult.canoon.processing){
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "result": "processing" }));
	    res.end();
	} else {
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "result": stackAnalysisService.anaylysisResult.canoon }));
	    res.end();
	}
});

router.get('/canoonThreeProcessing', function(req, res, next) {

	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "result": stackAnalysisService.anaylysisResult.canoon.processing }));
    res.end();
});


router.get('/fetchAllStockDataName', function(req, res, next) {

	stockNameService.fetchAllNames();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": 'started' }));
    res.end();
});

router.get('/storeStockToDB', function(req, res, next) {
	stockNameService.getStockInformation();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": 'started' }));
    res.end();
});

router.get('/viewStatus', function(req, res, next) {
	res.render('statusSimple', { title: 'Express' });
});


module.exports = router;
