
/**
 * Module dependencies.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var monk = require('monk');
var config = require('./config/config.json');
var db = monk(config.host + '/' + config.dbname);

var index = require('./routes/index');
var addresses = require('./routes/addresses');
var customers = require('./routes/customers');
var cities = require('./routes/cities');
var countries = require('./routes/countries');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Make customerDB accessible to our router
app.use(function(req,res,next){
    req.db = db;
    req.DEFAULT_LIMIT = 25;
    req.DEFAULT_OFFSET = 0;
    next();
});

app.use('/', index);
app.use('/addresses', addresses);
app.use('/customers', customers);
app.use('/cities', cities);
app.use('/countries', countries);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(app.get('port'), function(){
	console.log('Express server started on port : ' + app.get('port'));
});
