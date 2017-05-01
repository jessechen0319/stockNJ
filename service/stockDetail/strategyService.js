var shrunkStrategy = require('./amountShrunk');
var logger = require('../LogService');
var JobService = require("../JobService");
var macdStrategy = require('./macd');
var jobService = new JobService();
function runStrategy(jobId){
    jobService.updateJobRunning(jobId);
    shrunkStrategy.anountShrunk(function(){
        macdStrategy.macd(()=>{
            logger.info('strategy service finished');
            jobService.updateJobFinished(jobId);
        });
    });
}

module.exports.runStrategy = runStrategy;