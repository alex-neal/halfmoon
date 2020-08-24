var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk(process.env.MONGO_CONN_STRING);

// multer package for image file uploads
var multer = require('multer');
var storage = multer.diskStorage({
    destination: 'public/images/products/',
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})
var upload = multer({ storage: storage})


// View all products
router.get('/', function(req, res) {
  res.render('products', {search: req.query.search, admin: req.session.admin});
});

// Render new product form (admin)
router.get('/new', function(req, res) {
  if (req.session.admin) {
    res.render('new');
  } else {
    res.render('message', {message: "Access denied (admin only)"});
  }
});

// Show a product
router.get('/:id', function(req, res) {
	var collection = db.get('products');
	collection.findOne({ _id: req.params.id }, function(err, product){
		if (err) throw err;
	  	res.render('show', { product: product, admin : req.session.admin });
	});
});



// Add a new product (admin)
router.post('/', upload.single('image'), function (req, res, next) {
  if(req.session.admin) {
    var collection = db.get('products');
    collection.insert({
        name: req.body.name,
        category: req.body.category,
        price: Number(req.body.price),
        qty_in_stock: Number(req.body.quantity),
        description: req.body.desc,
        image: req.file.originalname,
        deleted: false

    }, function(err, product){
        if (err) throw err;

        res.redirect('/products');
    });
  } else {
    res.render('message', {message: "Access denied (admin only)"});
  }

})

// Render edit product page (admin)
router.get('/:id/edit', function(req, res) {
  if (req.session.admin) {
    var collection = db.get('products');
    collection.findOne({_id: req.params.id }, function(err, product) {
        if (err) throw err;
        res.render('edit', {product: product})
    })
  } else {
    res.render('message', {message: "Access denied (admin only)"})
  }
})

// Update product details (admin)
router.put('/:id', upload.single('image'), function(req, res, next) {
  if (req.session.admin) {
    var collection = db.get('products');

    var newFields = {"name" : req.body.name,
              "category": req.body.category,
              "price": Number(req.body.price),
              "qty_in_stock": Number(req.body.quantity),
              "description": req.body.desc}
    if (req.file) {
      newFields["image"] = req.file.originalname;
    }

    collection.update({_id: req.params.id}, {$set: newFields}, function(err, result) {
      if (err) throw err;
      res.redirect('/products/' + req.params.id);
    })
  } else {
    res.render('message', {message: "Access denied (admin only)"});
  }
});

// Soft-delete a product (admin)
router.delete('/:id', function(req, res){
  if (req.session.admin) {
    var collection = db.get('products');
    collection.update({ _id: req.params.id }, 
            {$set: {deleted: true}}, 
            function(err, result) {
              if (err) throw err;
              res.redirect('/products');
    });
  } else {
    res.render('message', {message: "Access denied (admin only)"});
  }
});


module.exports = router;