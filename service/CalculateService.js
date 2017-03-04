var http = require('http');
function calcMACD({preEma12, preEma26, preDea, price}){

	//EMA（12） = 前一日EMA（12） X 11/13 + 今日收盘价 X 2/13
	var ema12 = preEma12*11/13 + price*2/13;
	//EMA（26） = 前一日EMA（26） X 25/27 + 今日收盘价 X 2/27
	var ema26 = preEma26*25/27 + price*2/27;
	//DIF = EMA（12） - EMA（26） 。快线
	var dif = ema12 - ema26;
	//DEA = （前一日DEA X 8/10 + 今日DIF X 2/10）。慢线
	var dea = preDea*8/10 + dif/5;
	//（DIF-DEA）*2
	var barValue = (dif - dea)*2;
	return{
		"dif": dif,
		"dea": dea,
		"bar": barValue,
		"ema12": ema12,
		"ema26": ema26,
		"dif": dif
	}
}
/*
var options = {
  host: 'q.stock.sohu.com',
  port: 80,
  path: '/hisHq?code=cn_601628&start=19900101&end=20170207&stat=1&order=D&period=d&callback=historySearchHandler&rt=jsonp&r=0.9310515393362175&0.40358688832404455'
};

http.get(options, function(response) {
  var body = "";
  response.on("data", function(data) {
      body += data;
  });
  response.on("end", function() {

  	var data = JSON.parse(body.slice(21, body.length-2));
  	var stockCode = data[0].code.slice(3, data[0].code.length)
  	data[0]['hq'].forEach(function(item){
  		var stockObject = {
  			'stockCode':stockCode
  		}
  		stockObject.date = item[0];
  		stockObject.beginPrice = Number(item[1]);
  		stockObject.price = Number(item[2]);
  		stockObject.lowPrice = Number(item[5]);
  		stockObject.topPrice = Number(item[6]);
  		stockObject.amountStock = Number(item[7])*100;
  		stockObject.amountStock = Number(stockObject.amountStock.toFixed(0));
  		stockObject.amountMoney = Number(item[8])*10000;
  		stockObject.amountMoney = Number(stockObject.amountMoney.toFixed(0));
  		console.log(stockObject);
  	});
  });
});*/

module.exports.calcMACD = calcMACD;

//http://q.stock.sohu.com/hisHq?code=cn_601628&start=19900101&end=20170207&stat=1&order=D&period=d&callback=historySearchHandler&rt=jsonp&r=0.9310515393362175&0.40358688832404455