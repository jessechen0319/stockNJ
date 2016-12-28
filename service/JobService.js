var MySqlService = require("./MySqlService");
var logger = require('./LogService');
var Util = require("./Util");

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

	this.createJob = function(type, callback, source){

		MySqlService.query('insert into t_job (job_type_id, job_status_id, date, source) values (?, ?, ?, ?)', [type, 1, Util.generateMySqlDate(new Date()), source?source:"UNKOWN"], function(err, result) {
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