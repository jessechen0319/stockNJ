var app = angular.module('stock', []);

app.controller('index', function ($scope, $http, $rootScope) {
	var nowDate = new Date();
	var dayInMonth = nowDate.getDate();
	var month = nowDate.getMonth()+1;
	var year = nowDate.getFullYear();
	var dateFormate = `${year}-${month}-${dayInMonth}`;
	$scope.nowDate = dateFormate;
	$scope.nameProcessPercentage = 0;
	$scope.stockProcessPercentage = 0;
	$scope.trackLastFiveDays = [];
	$rootScope.errors = [];
	$scope.disableFetchStockFlag = false;

	$rootScope.clearThisError = function(message){

		$rootScope.errors = $rootScope.errors.filter(function(item){
		    return item != message
		});
	};

	$scope.fetchStockDetail = function(){

		var todayFetchStatus;
		$scope.dateValidations.forEach(function(item){
			if (item.date == $scope.nowDate) {
				todayFetchStatus = item;
			}
		});

		if(todayFetchStatus && todayFetchStatus.valid == 'validate-success'){
			$rootScope.errors.push('Today data has already been fetched, please fetch data tomorrow');
			return;
		}

		if(Number($scope.stockProcessPercentage) != 0 && Number($scope.stockProcessPercentage) != 100){
			$rootScope.errors.push('Fetching, please do not run duplicated');
			return;
		}

		$scope.disableFetchStockFlag = true;

		$http({
		  method: 'GET',
		  url: '/storeStockToDB'
		}).then(function successCallback(response) {
			$rootScope.errors.push('The fetch is started');
			$http({
			  method: 'GET',
			  url: '/getDetailProcessRate'
			}).then(function successCallback(response) {
				$scope.disableFetchStockFlag = false;
			}, function errorCallback(response) {
			});
		}, function errorCallback(response) {
			$scope.disableFetchStockFlag = false;
			$rootScope.errors.push('The fetch is failed');
		});
	};
	

/*	setInterval(function(){
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
			if(response.data.processRate == 100) {
				//when it finished, refresh the calendar
				$http.post('/checkFetchDates', { 'dates': $scope.trackLastFiveDays }).then(function successCallback(response) {
					console.log(response.data);
					$scope.dateValidations = response.data;
				}, function errorCallback(response) {
				});
			}
		}, function errorCallback(response) {
		});
	}, 2000);*/

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

app.controller('maunalOrder', function($scope, $http, $rootScope){
	//$scope.manualFetch
});