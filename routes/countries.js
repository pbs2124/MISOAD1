var express = require('express');
var router = express.Router();
var convert = require('./../utilities/converters.js');
var db = require('./../database/database.js');
var async = require('async');

var cityCollection = db.get('city');
var countryCollection = db.get('country');

router.use(function timeLog(req, res, next) {
    console.log('Accessed Countries URI Page at Time: ', new Date());
    next();
});

// Get the List of all countries
router.get('/', function(request, response) {
    var query = JSON.parse(JSON.stringify(request.query));
    var limit;
    var offset;
    var sort = {};
    var filter = {};

    if (!query.offset || isNaN(query.offset)) {
        offset = request.DEFAULT_OFFSET;
    }
    else {
        offset = Number(query.offset);
    }

    if (!query.limit || isNaN(query.limit)) {
        limit = request.DEFAULT_LIMIT;
    }
    else {
        limit = Number(query.limit);
    }

    if (query.sort) {
        // If it contains &&, it need to send a error response
        var res = String(query.sort).trim();
        var length = res.length;
        res = res.substr(1, length - 2).split('||');
        res.forEach(function(element) {
            var order = 1;
            if (element.indexOf('-') === 0) {
                order = -1;
                element = element.substr(1, element.length - 1);
            }
            else {
                order = 1;
            }

            if (element.toUpperCase() === 'COUNTRY') {
                sort.country = order;
            }
        });
    }

    if (!sort) {
        sort = {
            country_id: 1
        };
    }

    if (query.filter) {
        console.log(query.filter);
    }

    var count;
    async.waterfall(
        [
            function(callback) {
                countryCollection.count({}, callback);
            },
            function(countryCount, callback) {
                count = countryCount;
                var optionalParam = {
                    limit: limit,
                    skip: offset,
                    sort: sort
                }
                countryCollection.find({}, optionalParam, callback);
            }
        ],
        function(err, results) {
            if (err) {
                return response.status(500).json(err);
            }
            else if (results) {
                return response.json(convert.fromCountryDB(results, true, offset, limit, count, query.sort, query.filter, query.fields));
            }
            else {
                return response.status(404).json(404);
            }
        }
    );
});

// GET, PUT, DELETE, POST of a Particular Country
router.get('/:id', function(request, response) {
    countryCollection.find({
        country_id: Number(request.params.id)
    }, {}, function(err, country) {
        if (err) {
            return response.status(500).json(err);
        }
        else if (country) {
            return response.json(convert.fromCountryDB(country));
        }
        else {
            return response.status(404).json(404);
        }
    });
});

router.put('/:id', function(request, response) {

    if (!request.body) {
        console.error('No Body...!!!');
        return response.status(400).json(400);
    }

    var country = convert.toCountryDB(request.body);

    if (country && country[0] && country[0]._id && country[0].country_id && !isNaN(country[0].country_id) && !isNaN(request.params.id) && Number(country[0].country_id) === Number(request.params.id)) {

        var temp = {};

        if (typeof(country[0].country) != undefined) temp.country = country[0].country;
        if (typeof(country[0].last_update) != undefined) temp.last_update = country[0].last_update;

        countryCollection.update({
            country_id: Number(request.params.id)
        }, {
            $set: temp
        }, function(err) {
            if (err) {
                return response.status(500).json(err);
            }
            else {
                return response.status(204).end();
            }
        });
    }
    else {
        return response.status(400).json(400);
    }
});

router.delete('/:id', function(request, response) {
    if (!isNaN(request.params.id)) {
        async.waterfall([
            function(callback) {
                cityCollection.count({
                    country_id: Number(request.params.id)
                }, callback);
            },
            function(count, callback) {
                if (count > 0) {
                    var err = new Error();
                    err.status = 403;
                    err.message = 'Unable to Delete the Country with CountryID: ' + Number(request.params.id) + ', ' + count + ' cities have this country as a reference';
                    return callback(err);
                }
                else {
                    countryCollection.remove({
                        country_id: Number(request.params.id)
                    }, callback);
                }
            }
        ], function(err, results) {
            if (err) {
                return response.status(err.status || 500).json(err);
            }
            else {
                return response.status(204).end();
            }
        });
    }
    else {
        return response.status(400).json(400);
    }
});

module.exports = router;