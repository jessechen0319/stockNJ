var http = require('http');
var fs = require('fs');

var Util = (function(){

	function generateCurrentDate(){
		var now = new Date();
		let year = now.getFullYear();
		let month = now.getMonth()+1;
		let day = now.getDate();
		let result = `${year}-${month}-${day}`;
		return result;
	}

	function generateMySqlDate(date){

		if(date instanceof Date){
			return date.toISOString().slice(0, 19).replace('T', ' ');
		} else {
			return null;
		}
	}
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

	function removeDir(path) {

    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                removeDir(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

	return {"pad": pad,
			"fetchPath": fetchPath,
			"generateMySqlDate": generateMySqlDate,
			"generateCurrentDate":generateCurrentDate,
			"removeDir":removeDir
			};
})();

module.exports = Util;