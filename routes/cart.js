var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/halfmoon');

// Add item to cart
router.post('/', function(req, res) {
    // Require login
    if(req.session.userId) {
        var products = db.get('products');
        var users = db.get('users');

        // Decrement qty_in_stock if there is enough inventory
        products.update({ _id: req.body.productId, qty_in_stock: {$gte: Number(req.body.quantity)}}, 
            { $inc: { qty_in_stock: -req.body.quantity }},
            function(err, result) {
                if (err) throw err;

                // If qty_in_stock successfully decremented, add item to user's cart
                if (result.nModified > 0) {
                    users.update(
                        { _id: req.session.userId},
                        { $push: {cart: 
                            {productId: req.body.productId,
                            quantity: Number(req.body.quantity)}
                        }}, function(err, user) {
                            if (err) throw err;
                            res.redirect('/cart');
                        });
                } else {
                    res.render('message', {message : "Not enough in stock. Try a lower quantity."})
                }
            }
        );
        
    } else {
        res.render('message', {message: "You must be logged in to add items to your cart."});
    }
})

// Get all products in a user's cart 
router.get('/', function(req, res) {
    if (!req.session.userId) {
        res.render('message', {message: "Please log in to view your cart"});
    } else {
        req.session.subtotal = 0.0;
        var users = db.get('users');
        users.findOne({_id: req.session.userId}, function(err, user) {
        	if (err) throw err;
        	if(user) {
        		var productIds = []
        		var cartItems = {}
        		for (i=0; i<user.cart.length; i++) {
        			productIds.push(user.cart[i].productId);
        		}
        		var products = db.get('products');
        		products.find({
        			_id: {$in: productIds}
        		}, function(err, products) {
        			for (i=0; i<products.length; i++) {
        				var item = {"_id" : products[i]._id,
        							"name" : products[i].name,
        							"price" : products[i].price,
        							"image" : products[i].image}
        				cartItems[products[i]._id] = item;
                        
        			}
        			for (i=0; i<user.cart.length; i++) {
                        var productId = user.cart[i].productId;
        				cartItems[productId].quantity = user.cart[i].quantity
                        req.session.subtotal += cartItems[productId].price * cartItems[productId].quantity;

        			}

        			res.render('cart', {cartItems: Object.values(cartItems), subtotal: req.session.subtotal});
        		})
        	}
        })
    }
})

// Remove an item from cart
router.delete('/:id', function(req, res) {
    // Require login
    if (!req.session.userId) {
        res.render('message', {message: "You are no longer logged in."});
    } else {
        var users = db.get('users');
        var products = db.get('products');

        // Remove item from user's cart
        users.update(
            { _id: req.session.userId},
            { $pull: {cart: {productId: req.params.id}}
            }, function(err, user) {
                if (err) throw err;

                // Increment product inventory by qty that was in cart
                products.update({_id: req.params.id},
                    { $inc: {qty_in_stock: Number(req.body.qty)}},
                    function(err, result) {
                        if (err) throw err;
                        res.redirect('/cart');
                    })
            });
    }
})

// Update item quantity in cart
router.put('/:id', function(req, res) {
    if (!req.session.userId) {
        res.render('message', {message: "You are no longer logged in."});
    } else {
        var products = db.get('products');
        var users = db.get('users');

        var deltaQty = Number(req.body.oldQty) - Number(req.body.qty);
        var productQuery = {"_id": req.params.id};

        if (deltaQty != 0) {
            if (deltaQty < 0) {
                productQuery['qty_in_stock'] = {$gte: -deltaQty}
            }

            products.update(productQuery,
                { $inc: { qty_in_stock: deltaQty }}, function(err, result) {
                    if (err) throw err;

                    // If qty_in_stock successfully altered, change qty in user's cart
                    if (result.nModified > 0) {
                        users.update(
                            { _id: req.session.userId, "cart.productId": req.params.id},
                            { $set: { "cart.$.quantity": Number(req.body.qty)}
                            }, function(err, user) {
                                if (err) throw err;
                                res.redirect('/cart');
                            });
                    } else {
                        res.render('message', {message : "Not enough in stock. Try a lower quantity."})
                    }
                });
        }
    }
})

module.exports = router;







