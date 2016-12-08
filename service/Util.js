var http = require('http');

var Util = (function(){
	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}

	function fetchPath({host, path, callback}){
		var options = {
	      host: host,
	      port: 80,
	      path: path
	    };

	    http.get(options, function(response) {
	      var body = "";
	      response.on("data", function(data) {
	          body += data;
	      });
	      response.on("end", function() {
	      	
	      	callback(body);
	      });
	      response.on("error", function(e) {
	      	callback(null, e);
	      });
	    });
	}

	return {"pad": pad,
			"fetchPath": fetchPath
			};
})();

module.exports = Util;