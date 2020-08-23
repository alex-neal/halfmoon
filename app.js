var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var session = require('express-session')
var methodOveride = require('method-override');
var multer = require('multer');

var indexRouter = require('./routes/index');
var accountRouter = require('./routes/account');
var productsRouter = require('./routes/products');
var cartRouter = require('./routes/cart');
var ordersRouter = require('./routes/orders');
var apiRouter = require('./routes/api')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(methodOveride('_method'));
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  cookie: {maxAge: 1200000}
}));

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/cart', cartRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


const port = process.env.PORT || 3000;
app.listen(port);

module.exports = app;
