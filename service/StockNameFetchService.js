var MySqlService = require("./MySqlService");
var Util = require("./Util");

function StockNameFetch(){

	function _generateInitialPaths(){

		var paths = [];
		//shanghai
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sh60${partialCode}`;
			paths.push(URL);
		}
		//shengzheng
		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz00${partialCode}`;
			paths.push(URL);
		}

		for (var i = 0; i < 10000; i++) {
			var partialCode = Util.pad(i, 4);
			var URL = `/list=sz30${partialCode}`;
			paths.push(URL);
		}
		return paths;
	}




	this.fetchName = function(){
		var paths = _generateInitialPaths();
		function _fetch(){
			var path = paths.shift();
			Util.fetchPath({"host": 'hq.sinajs.cn', "path": path, "callback": function(data, err){
				console.log(data);
				if(paths.length != 0){
					console.log(paths.length);
					_fetch();
				}
			}});
		}

		_fetch();
	};
}

var stockNameFetch = new StockNameFetch();
stockNameFetch.fetchName();