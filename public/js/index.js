var app = angular.module('stock', []);

app.controller('index', function ($scope, $http) {
	var nowDate = new Date();
	var dayInMonth = nowDate.getDate();
	var month = nowDate.getMonth();
	var year = nowDate.getFullYear();
	var dateFormate = `${year}-${month}-${dayInMonth}`;
	$scope.nowDate = dateFormate;
	$scope.nameProcessPercentage = 0;
	$scope.stockProcessPercentage = 0;
	$scope.trackLastFiveDays = [];
	

	setInterval(function(){
		$http({
		  method: 'GET',
		  url: '/getProcessRate'
		}).then(function successCallback(response) {
			$scope.nameProcessPercentage = Number(response.data.processRate);
		}, function errorCallback(response) {
		});

		$http({
		  method: 'GET',
		  url: '/getDetailProcessRate'
		}).then(function successCallback(response) {
			$scope.stockProcessPercentage = Number(response.data.processRate);
		}, function errorCallback(response) {
		});
	}, 2000);

	for (var i = 0; i < 5; i++) {
		var dateTemp = new Date();
		dateTemp.setDate(nowDate.getDate() - i);
		var dayInMonth = dateTemp.getDate();
		var month = dateTemp.getMonth()+1;
		var year = dateTemp.getFullYear();
		var dateFormate = `${year}-${month}-${dayInMonth}`;
		$scope.trackLastFiveDays.push(dateFormate);
	}

	$http.post('/checkFetchDates', { 'dates': $scope.trackLastFiveDays }).then(function successCallback(response) {
		console.log(response.data);
		$scope.dateValidations = response.data;
	}, function errorCallback(response) {
	});

	console.log($scope.trackLastFiveDays);
});