var express = require('express');
var router = express.Router();
var convert = require('./../utilities/converters.js');
var db = require('./../database/database.js');
var async = require('async');

var addressCollection = db.get('address');
var cityCollection = db.get('city');
var countryCollection = db.get('country');

router.use(function timeLog(req, res, next) {
    console.log('Accessed Cities URI Page at Time: ', new Date());
    next();
});

// Get the List of all cities
router.get('/', function(request, response) {
    var query = JSON.parse(JSON.stringify(request.query));
    var limit;
    var offset;
    var fields = {};
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

            if (element.toUpperCase() === 'CITY') {
                sort.city = order;
            }
        });
    }

    if (!sort) {
        sort = {
            city_id: 1
        };
    }

    if (query.filter) {
        console.log(query.filter);
    }

    if (query.fields) {
        var order = 1;
        fields.city_id = order;
        var res = String(query.fields).trim();
        var length = res.length;
        res = res.substr(1, length - 2).split('||');
        res.forEach(function(element) {
            if (element.toUpperCase() === 'CITY') {
                fields.city = order;
            }
            if (element.toUpperCase() === 'COUNTRY' || element.toUpperCase() === 'COUNTRY_ID') {
                fields.country_id = order;
            }
        });
    }

    var count;
    async.waterfall(
        [
            function(callback) {
                cityCollection.count({}, callback);
            },
            function(cityCount, callback) {
                count = cityCount;
                var optionalParam = {
                    limit: limit,
                    skip: offset,
                    sort: sort,
                    fields: fields
                }
                cityCollection.find({}, optionalParam, callback);
            }
        ],
        function(err, results) {
            if (err) {
                return response.status(500).json(err);
            }
            else if (results) {
                return response.json(convert.fromCityDB(results, true, offset, limit, count, query.sort, query.filter, query.fields));
            }
            else {
                return response.status(404).json(404);
            }
        }
    );
});

// GET, PUT, DELETE, POST of a Particular city
router.get('/:id', function(request, response) {
    cityCollection.find({
        city_id: Number(request.params.id)
    }, {}, function(err, city) {
        if (err) {
            return response.status(500).json(err);
        }
        else if (city) {
            return response.json(convert.fromCityDB(city));
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

    var city = convert.toCountryDB(request.body);

    if (city && city[0] && city[0]._id && city[0].city_id && !isNaN(city[0].city_id) && !isNaN(request.params.id) && Number(city[0].city_id) === Number(request.params.id)) {

        var temp = {};

        if (typeof(city[0].city) != undefined) temp.city = city[0].city;
        if (typeof(city[0].country_id) != undefined) temp.country_id = city[0].country_id;
        if (typeof(city[0].last_update) != undefined) temp.last_update = city[0].last_update;

        cityCollection.update({
            city_id: Number(request.params.id)
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
                addressCollection.count({
                    city_id: Number(request.params.id)
                }, callback);
            },
            function(count, callback) {
                if (count > 0) {
                    var err = new Error();
                    err.status = 403;
                    err.message = 'Unable to Delete the City with CityID: ' + Number(request.params.id) + ', ' + count + ' Addresses have this city as a reference';
                    return callback(err);
                }
                else {
                    cityCollection.remove({
                        city_id: Number(request.params.id)
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

router.get("/:id/country", function(request, response) {

    async.waterfall([
        function(callback) {
            cityCollection.find({
                city_id: Number(request.params.id)
            }, {}, callback);
        },
        function(city, callback) {
            if (city && city[0]) {
                countryCollection.find({
                    country_id: Number(city[0].country_id)
                }, {}, callback);
            }
            else {
                var err = new Error('Not Found');
                err.status = 404;
                return callback(err);
            }
        }
    ], function(err, results) {
        if (err) {
            return response.status(err.status || 500).json(err);
        }
        else if (results) {
            return response.json(convert.fromCountryDB(results));
        }
        else {
            return response.status(404).json(404);
        }
    });
});


module.exports = router;