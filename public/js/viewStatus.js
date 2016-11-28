var app = angular.module('stock', []);
app.controller('ViewStatus', function ($scope, $http) {
	$scope.triggerFetch = function(){
		$http({
		  method: 'GET',
		  url: '/fetchAllStockDataName'
		}).then(function successCallback(response) {
			
		}, function errorCallback(response) {

		});
	};
});