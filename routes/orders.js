var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk(process.env.MONGODB_URI || 'localhost:27017/halfmoon');

const TAX_RATE = 0.08;


// View the user's past orders
router.get('/', function(req, res) {
	if (req.session.userId) {
		var collection = db.get('orders');
		collection.find({ userId: req.session.userId}, function(err, orders){
			if (err) throw err;
		  	res.render('orders', {orders: orders});
		});
	} else {
		res.render('message', { message : "You must be logged in to view this page."});
	}
});

// Place an order
router.post('/', function(req, res) {
	if (req.session.userId) {
		var users = db.get('users');
		var orders = db.get('orders');
		users.findOne({ _id: req.session.userId}, function(err, user){
			if (err) throw err;
		  	var cart = user.cart;
		  	var order = {
		  		"userId": req.session.userId,
		  		"status": "ordered",
		  		"date": Date(),
		  		"total": req.session.total,
		  		"items": cart,
		  		"shippingAddress" : {"address1" : req.body.shipAddress1,
		  							"address2": req.body.shipAddress2,
		  							"city" : req.body.shipCity,
		  							"state" : req.body.shipState,
		  							"zip" : req.body.shipZip}
		  	};

		  	orders.insert(order, function(err, order) {
		  		if (err) throw err;
		  		users.update({ _id: req.session.userId},
		            { $set: {cart: []}
		          	}, function(err, user) {
		          		if (err) throw err;
		          		req.session.subtotal = null;
		          		req.session.total = null;
		                res.render('message', {message: "Your order has been placed!"});
		        });
	        });

		});

	} else {
		res.render('message', {message: "Please log in to place an order"});
	}
});


// Calculate order total and render checkout page
router.post('/checkout', function(req, res) {
	if (req.session.userId) {
		var tax = req.session.subtotal * TAX_RATE;
		req.session.total = req.session.subtotal + tax;
		res.render('checkout', {subtotal: req.session.subtotal.toFixed(2), 
								tax: tax.toFixed(2), 
								total: req.session.total.toFixed(2)});
	} else {
		res.render('message', {message: "Please log in to place an order."});
	}
})

// Render details about a specific order
router.get('/:id', function(req, res) {
	if (req.session.userId) {
		var orders = db.get('orders');
		var products = db.get('products');
		orders.findOne({_id: req.params.id}, function(err, order) {
			if (err) throw err;
			var productIds = [];
			for (i = 0; i < order.items.length; i++) {
				productIds.push(order.items[i].productId);
			}
			products.find({_id: {$in: productIds}}, function(err, products) {
				if (err) throw err;
				res.render('orderdetails', {order: order, products: products});

			})
		})
	} else {
		res.render('message', {message: "Please log in to view past orders."})
	}
})



module.exports = router;