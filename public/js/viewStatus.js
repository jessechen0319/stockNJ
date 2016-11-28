// var app = angular.module('stock', []);
// app.controller('ViewStatus', function($scope, data) {
    
//     $scope.triggerFetch = function(){
    	// data.triggerFetchName(function(){
    	// 	console.log('trigger finished');
    	// }, function(){
    	// 	console.log('trigger failed');
    	// });
//     };
// });

var app = angular.module('stock', []);
 
app.controller('ViewStatus', function ($http) {
	$http({
	    url:'/fetchAllStockDataName',
	    method:'GET',
	    success: success,
	    error: error
	});
});