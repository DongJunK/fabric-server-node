var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

const { sequelize } = require('./models');

require('./config.js');
require('dotenv').config();


var indexRouter = require('./routes/index');
var ticketRouter = require('./routes/ticket');
var tokenRouter = require('./routes/token');
var userRouter = require('./routes/users');


var app = express();
sequelize.sync();

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////

app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data

app.use(bodyParser.json({limit: '50mb'}));
//support parsing of application/x-www-form-urlencoded post data

app.use(bodyParser.urlencoded({
	limit: '50mb', extended: true
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/ticket',ticketRouter);
app.use('/token',tokenRouter);
app.use('/users',userRouter);


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

module.exports = app;
