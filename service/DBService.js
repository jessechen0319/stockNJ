var DBPath = "../db/db.json";
var jsonfile = require('jsonfile')

var db = (function(){

	function readDb(callback){

		jsonfile.readFile(DBPath, function(err, obj) {
			callback(err, obj);
		})
	}

	function writeDb(obj, callback){

		jsonfile.writeFile(DBPath, obj, function (err) {
		  callback(err)
		})
	}

	return {'readDb':readDb,
		'writeDb':writeDb};
})();

module.exports = db;