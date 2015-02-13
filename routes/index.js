
/*
 * GET home page.
 */
var express = require('express');
var router = express.Router();

//middleware specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Accessed Index Page at Time: ', new Date());
  next();
});

router.get('/', function(request, response){
	response.render('index', { title: 'Modern Internet Service Oriented Application Development Class...!!!' });
});

module.exports = router;