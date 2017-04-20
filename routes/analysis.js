var express = require('express');
var router = express.Router();

var analysisService = require("../service/stockDetail/strategyService");
var JobService = require("../service/JobService");
var jobService = new JobService();
router.get('/index', function(req, res, next) {

	jobService.createJob(3, function(err, jobId){
        if(err){
            res.statusCode = 500;
            res.end(err);
        } else {
            analysisService.runStrategy(jobId);
            res.setHeader('Content-Type', 'application/json');
		    res.send(JSON.stringify({'jobId':jobId}));
		    res.end();
        }
    }, "daily analysis for each strategy");
	
    
});

module.exports = router;
