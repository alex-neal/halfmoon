var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('mongodb+srv://app:MDBbeau14@halfmoon.ga0nv.mongodb.net/halfmoon?retryWrites=true&w=majority');


// Get a JSON product array (accepts search/category parameters)
router.get('/products', function(req, res) {
	var query = {"deleted" : false}
	if (req.query.category) {
		if (Array.isArray(req.query.category)) {
			query["category"] = { '$in' : req.query.category};
		} else {
			query["category"] = req.query.category;
		}
	}

	if(req.query.search) {
		query['$text'] = { '$search' : req.query.search};
	}

	var collection = db.get('products');
	collection.find(query, function(err, products){
		if (err) throw err;
	  	res.json(products);
	});
});

// Get JSON object for specific product
router.get('/products/:id', function(req, res) {
	var collection = db.get('products');
	collection.findOne({ _id: req.params.id }, function(err, product){
		if (err) throw err;
	  	res.json(product);
	});
});

// Check if an account exists (for form validation)
router.get('/account/check/:email', function(req, res) {
	var users = db.get('users');
	users.findOne({email: req.params.email}, function(err, user) {
		if (err) throw err;
		if (user) {
			res.json({found: true});
		} else {
			res.json({found: false});
		}
	});
})

module.exports = router;