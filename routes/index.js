var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/catalog/');
});

/* Testar códigos */
var indexController = require('../controllers/indexController')

router.get('/test', indexController.test_get);

module.exports = router;
