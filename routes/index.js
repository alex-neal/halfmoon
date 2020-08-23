var express = require('express');
var router = express.Router();


// Redirect to home page
router.get('/', function(req, res, next) {
  res.redirect('/home');
});

// Render home page
router.get('/home', function(req, res, next) {
  res.render('index');
});


module.exports = router;
