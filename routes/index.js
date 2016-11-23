var express = require('express');
var router = express.Router();

var StockNameService = require("../service/StockNameService");
var stockNameService = new StockNameService();

/* GET home page. */
router.get('/', function(req, res, next) {
	
	stockNameService.fetchAllNames();
	res.render('index', { title: 'Express' });
});

router.get('/getProcessRate', function(req, res, next) {

	var processRate = stockNameService.getProcessRate();
	res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "processRate": processRate }));
    res.end();
});


module.exports = router;
