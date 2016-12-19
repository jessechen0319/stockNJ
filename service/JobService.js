var MySqlService = require("./MySqlService");
var logger = require('./LogService');

function JobService(){

	this.updateJobFailed = function(jobid, callback){
		MySqlService.query('update t_job set job_status_id = 4 where job_id = ?', [jobid], function(err, result) {
		  if (err){
		  	logger.info("fail to update job");
		  	callback?callback(err):"";
		  } else {
		  	logger.info("update job for ->"+result);
		  	callback?callback(null, result):"";
		  }
		});
	};

	this.updateJobFinished = function(jobid, callback){
		MySqlService.query('update t_job set job_status_id = 3 where job_id = ?', [jobid], function(err, result) {
		  if (err){
		  	logger.info("fail to update job");
		  	callback?callback(err):"";
		  } else {
		  	logger.info("update job for ->"+result);
		  	callback?callback(null, result):"";
		  }
		});
	};


	this.updateJobRunning = function(jobid, callback){
		MySqlService.query('update t_job set job_status_id = 2 where job_id = ?', [jobid], function(err, result) {
		  if (err){
		  	logger.info("fail to update job");
		  	callback?callback(err):"";
		  } else {
		  	logger.info("update job for ->"+result);
		  	callback?callback(null, result):"";
		  }
		});
	};

	this.createJob = function(type, callback){

		MySqlService.query('insert into t_job (job_type_id, job_status_id) values (?, ?)', [type, 1], function(err, result) {
		  if (err){
		  	logger.info("fail to create job");
		  	callback?callback(err):"";
		  } else {
		  	logger.info("Create job for ->"+result.insertId);
		  	callback?callback(null, result.insertId):"";
		  }
		});
	};


}

module.exports = JobService;