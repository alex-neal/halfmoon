var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('mongodb+srv://app:MDBbeau14@halfmoon.ga0nv.mongodb.net/halfmoon?retryWrites=true&w=majority');

var bcrypt = require('bcrypt');	// for password salting/hashing



// Path to user account page (or redirect to login if no user logged in)
router.get('/', function(req, res) {
  if (req.session.userId) {
  	users = db.get('users');
  	users.findOne({ _id: req.session.userId}, function(err, user) {
  		if (err) throw err;
  		if (user) {
  			res.render('account', {user: user})
  		}
  	})
  } else {
  	res.render('login', {message: null});
  }
});

// Insert a new user into database
router.post('/create', function (req, res) {
    var collection = db.get('users');

    bcrypt.hash(req.body.password, 10, function(err, hash) {
	    collection.insert({
	        email: req.body.email,
	        password: hash,
	        firstname: req.body.first,
	        lastname: req.body.last,
	        cart: []
	    }, function(err, user){
	        if (err) throw err;
	        res.render('accountcreated');
	    });
    })
});

// Log a user in
router.post('/login', function(req, res) {
	var collection = db.get('users');
	collection.findOne({ email: req.body.email }, function(err, user){
		if (err) throw err;
		if (user) {
		  	bcrypt.compare(req.body.password, user.password, function(err, match) {
		  		if (match) {
		  			req.session.userId = user._id;
		  			if (user.admin) {
		  				req.session.admin = true;
		  			}
		  			res.redirect('/account');
		  		} else {
		  			res.render('login', {message: "Password Incorrect!"});
		  		}
		  	})
		} else {
			res.render('login', {message: "No Account Found!"});
		}
	});
});

// Log a user out
router.get('/logout', function(req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) throw err;
            res.redirect('/');
        });

    }
});

// Delete account
router.delete('/', function(req, res) {
	if (req.session.userId) {
		var users = db.get('users');
		var orders = db.get('orders');
		var products = db.get('products');

		// Return cart items to inventory
		users.findOne({_id: req.session.userId}, function(err, user) {
			if (err) throw err;
			if (user.cart.length > 0) {
				user.cart.forEach(function(item) {
					products.update({_id: item.productId},
						{$inc: {qty_in_stock: item.quantity}},
						function (err, product) {
							if (err) throw err;
						})
				})
			}
		})

		// Delete account (associated orders are not deleted)
		users.remove({_id: req.session.userId}, function(err, result) {
			if (err) throw err;
			req.session.destroy(function(err) {
				if(err) throw err;
				res.render('message', {message: "Your account has been deleted"});
			})
		})
	} else {
		res.render('message', {message: "Your session has expired"})
	}
})

module.exports = router;