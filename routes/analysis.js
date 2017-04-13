var express = require('express');
var router = express.Router();

var shrunkAnalysis = require("../service/stockDetail/amountShrunk");

router.get('/shrunkAnalysis', function(req, res, next) {
	
	shrunkAnalysis.anountShrunk();
    res.end('shrunk analysis started');
});

module.exports = router;
