var mongo = require('mongodb');
var monk = require('monk');
var config = require('./../config/config.json');

var db = monk(config.host + '/' + config.dbname);

module.exports = db;