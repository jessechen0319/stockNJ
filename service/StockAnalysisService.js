var deferred = require('deferred');
var dbService = require("../service/DBService");
var logger = require('./LogService');

function StockAnalysis(){

	this.extractDate;

	var that = this;
	var anaylysisResult = {"canoon":{}};
	var dbData = {};

	var Util = (function(){

		function getFormatedNowDate(){
			var nowDate = new Date();
			var dayInMonth = nowDate.getDate();
			var month = nowDate.getMonth()+1;
			var year = nowDate.getFullYear();
			var dateFormate = `${year}-${month}-${dayInMonth}`;
			return dateFormate;
		}

		function getFormatedDateString({date}){

			var dayInMonth = date.getDate();
			var month = date.getMonth()+1;
			var year = date.getFullYear();
			var dateFormate = `${year}-${month}-${dayInMonth}`;
			return dateFormate;
		}

		return {
			getFormatedNowDate: getFormatedNowDate,
			getFormatedDateString: getFormatedDateString
		};
	})();

	function _checkAndUpdate(){
		var def = deferred();
		var todayString = Util.getFormatedNowDate();
		if ((that.extractDate == todayString || that.fetchingFlag) && Object.keys(dbData).length != 0){
			def.resolve();
		} else {
			//fetch the data
			dbService.readDb(function(err, db){
				that.extractDate == todayString;
				dbData = db;
				def.resolve();
			});
		}

		return def.promise();
	}

	function _getPreviousDaysData({days}){
		var data = [];
		var loopDate = new Date();
		var loopDays = days;
		var returnValue = [];
		var def = deferred();
		function _process(){
			if(dbData[Util.getFormatedDateString({date:loopDate})]){
				var item = {};
				item.date = Util.getFormatedDateString({date:loopDate});
				item.data = dbData[Util.getFormatedDateString({date:loopDate})];
				returnValue.push(item);
				loopDays--;
			}

			loopDate.setDate(loopDate.getDate() - 1);

			if(loopDays > 0){
				_process();
			} else {
				def.resolve(returnValue);
			}
		}
		_process();
		return def.promise();
	}

	function raiseCannonThree(){
		anaylysisResult.canoon = {};
		anaylysisResult.canoon.processing = true;
		_checkAndUpdate().then(function(){
			_getPreviousDaysData({days:3}).then(function(data){
				if(data.length == 3){
					//sort these days
					//day1 is latest day, day2 is yesterday, day3 is the day before yesterday
					var day1 = data[0], day2 = data[1], day3 = data[2];
					var anaylisysTemp = {};
					var returnData = [];
					var day1Date = new Date(day1.date), day2Date = new Date(day2.date), day3Date = new Date(day3.date);
					if(day1Date < day2Date){
						day1 = data[1];
						day2 = data[0];
					}

					if(day1Date < day3Date){
						var temp = day1;
						day1 = day3;
						day3 = temp;
					}

					if(day2Date < day3Date){
						var temp = day2;
						day2 = day3;
						day3 = temp;
					}

					day1.data.forEach(function(item, index){
						if(!anaylisysTemp['stock_'+item.stockCode]){
							anaylisysTemp['stock_'+item.stockCode] = {};
						}
						anaylisysTemp['stock_'+item.stockCode].day1 = item;
					});

					day2.data.forEach(function(item, index){
						if(!anaylisysTemp['stock_'+item.stockCode]){
							anaylisysTemp['stock_'+item.stockCode] = {};
						}
						anaylisysTemp['stock_'+item.stockCode].day2 = item;
					});

					day3.data.forEach(function(item, index){
						if(!anaylisysTemp['stock_'+item.stockCode]){
							anaylisysTemp['stock_'+item.stockCode] = {};
						}
						anaylisysTemp['stock_'+item.stockCode].day3 = item;
					});


					Object.keys(anaylisysTemp).forEach(function(item, index){
						
						var day1 = anaylisysTemp[item.toString()].day1;
						var day2 = anaylisysTemp[item.toString()].day2;
						var day3 = anaylisysTemp[item.toString()].day3;
						
						if(day1){
							if(day2){
								if(day3){
									if(Number(day3.price)>Number(day2.price)&&Number(day1.price)>Number(day2.price)&&Number(day1.price)>Number(day3.price)){
										if(Number(day1.amountStock)>Number(day2.amountStock)&&Number(day1.amountStock)>Number(day3.amountStock)&&Number(day3.amountStock)>Number(day2.amountStock)){
											if(Number(day3.price)>Number(day3.beginPrice)&&Number(day1.price)>Number(day1.beginPrice)){
												if(Number(day2.beginPrice)>Number(day3.beginPrice)&&Number(day2.lowPrice)>Number(day3.beginPrice)){
													var topPricePer1 = (Number(day1.topPrice) - Number(day1.price))/Number(day1.price);
													var topPricePer3 = (Number(day3.topPrice) - Number(day3.price))/Number(day3.price);
													if(topPricePer1<0.015&&topPricePer3<0.015){
														returnData.push(item);
													}
												}
											}
											
										}
									}
								}
							}
						}

						if(index == Object.keys(anaylisysTemp).length-1){
							anaylysisResult.canoon.processing = false;
							anaylysisResult.canoon.data = returnData;
							console.log(`process finished ${anaylysisResult.canoon.data.length} was found`);
						}
					});

					
				} else {
					//data is not correct, ignore analysis
					anaylysisResult.canoon.processing = false;
					anaylysisResult.canoon.data = {};
				}
			});
		});
	}

	return{
		"raiseCannonThree": raiseCannonThree,
		"anaylysisResult": anaylysisResult
	};
}

module.exports = StockAnalysis;