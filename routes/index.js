var express = require('express');
var router = express.Router();
var dbService = require("../service/DBService");

var StockNameService = require("../service/StockNameService");
var stockNameService = new StockNameService();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	res.render('index', { title: 'Express' });
});



router.get('/getProcessRate', function(req, res, next) {

	var processRate = stockNameService.getProcessRate();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "processRate": processRate }));
    res.end();
});


router.get('/fetchAllStockDataName', function(req, res, next) {

	stockNameService.fetchAllNames();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": 'started' }));
    res.end();
});

router.get('/storeToDB', function(req, res, next) {

	var stocks = stockNameService.stocks;
	if (stocks == {}||!stocks.trackDate||stockNameService.getProcessRate()!='100.00'||stockNameService.getProcessRate()!='0.00'){
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "status": 'NODATA' }));
	    res.end();
	} else {
		var trackData = stocks.trackDate;
		dbService.readDb(function(err, db){
			if(err){
				res.setHeader('Content-Type', 'application/json');
			    res.send(JSON.stringify({ "status": 'FAILUPDATE' }));
			    res.end();
			    return;
			}
			if(!db.stockPrimaryData){
				db.stockPrimaryData = {};
			}
			if(db.stockPrimaryData[trackData]){
				res.setHeader('Content-Type', 'application/json');
			    res.send(JSON.stringify({ "status": 'ALREADY_EXISTED' }));
			    res.end();
			    return;
			}
			db.stockPrimaryData[trackData] = stocks;
			dbService.writeDb(db, function(err){
				if(err){
					res.setHeader('Content-Type', 'application/json');
				    res.send(JSON.stringify({ "status": 'FAILUPDATE' }));
				    res.end();
				} else {
					res.setHeader('Content-Type', 'application/json');
				    res.send(JSON.stringify({ "status": 'SUCCESS' }));
				    res.end();
				}
			});
		});
	}
	
});

router.get('/viewStatus', function(req, res, next) {
	res.render('statusSimple', { title: 'Express' });
});


module.exports = router;
