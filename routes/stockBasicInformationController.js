var express = require('express');
var router = express.Router();
var StockNameFetch = require("../service/StockNameFetchService");
var JobService = require("../service/JobService");

var stockNameFetch = new StockNameFetch();
var jobService = new JobService();

router.get('/fetchName', function(req, res, next) {

	jobService.createJob(1, function(err, jobId){
		if(err){
			res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify({ "result": "failed" }));
		    res.end();
		} else {
			res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify({ "result": "success", "jobId":  jobId}));
		    stockNameFetch.fetchName(jobId);
		    res.end();
		}
	});
});

module.exports = router;