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

router.get('/getDetailProcessRate', function(req, res, next) {

	var processRate = stockNameService.getDetailProcessRate(function(rate){
		
		res.setHeader('Content-Type', 'application/json');
	    res.send(JSON.stringify({ "processRate": rate }));
	    res.end();
	});
});


router.get('/fetchAllStockDataName', function(req, res, next) {

	stockNameService.fetchAllNames();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": 'started' }));
    res.end();
});

router.get('/storeStockToDB', function(req, res, next) {
	stockNameService.getStockInformation();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "status": 'started' }));
    res.end();
});

router.get('/viewStatus', function(req, res, next) {
	res.render('statusSimple', { title: 'Express' });
});


module.exports = router;
