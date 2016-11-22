var express = require('express');
var router = express.Router();

var StockNameService = require("../service/StockNameService");

/* GET home page. */
router.get('/', function(req, res, next) {

	var stockNameService = new StockNameService();
	stockNameService.fetchAllNames();
	res.render('index', { title: 'Express' });
});

router.get('/getProcessRate', function(req, res, next) {

	var stockNameService = new StockNameService();
	var processRate = stockNameService.getProcessRate();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "processRate": processRate }));
    res.end();
});


module.exports = router;
