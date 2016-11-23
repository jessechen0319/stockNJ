var path = 'http://jesse-10068897.cos.myqcloud.com/db.json';
var http = require('http');

function DBService (){

	var writtingFlag = false;
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