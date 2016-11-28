// var app = angular.module('stock', []);

// var app = angular.module('app', []);
 
// app.config(function ($provide) {
//   $provide.factory('data', function ($scope, $http) {

  		// var data = {};

  	 //    data.getStatusOfFetchingName = function(success, error){
  	 //    	$http({
  	 //    	    url:'/getProcessRate',
  	 //    	    method:'GET',
  	 //    	    success: success,
  	 //    	    error: error
  	 //    	});
  	 //    };

  	 //    data.triggerFetchName = function(success, error){
  	    
  	 //    };

  	 //    return data;
//   });
// });

var app = angular.module('stock', []);
 
app.config(function ($provide) {
  $provide.factory('dataCenter', function ($http) {

  		return {
	      title: 'The Matrix'
	    }
  });
});