var path = 'http://jesse-10068897.cos.myqcloud.com/db.json';
var http = require('http');
var crypto = require('crypto');


function DBService (){

	var writtingFlag = false;

	function _getCurrentSecretKey(){
		var now = new Date();
		var seconds = now.getTime();
		var remoteOrigin = `a=10068897&b=jesse&k=AKIDX0JRPRyTNCsUBlJvGZionbP6czCELy53&e=7776000&t=${seconds}&r=1616161616&f=db.json`;
	}

	var getDBObject = function(){
		
		var options = {
		      host: 'jesse-10068897.cos.myqcloud.com',
		      port: 80,
		      path: '/db.json'
		    };

		http.get(options, function(response) {
		  var body = "";
		  response.on("data", function(data) {
		      body += data;
		  });
		  response.on("end", function() {
		  	
		  	var db = JSON.parse(body);
		  	console.log(db);
		  });
		});
	};

	return {
		getDBObject: getDBObject,
		writtingFlag: writtingFlag
	};
}

module.exports = DBService;