var express = require('express');
var router = express.Router();
var convert = require('./../utilities/converters.js');
var db = require('./../database/database.js');
var async = require('async');

var customerCollection = db.get('customer');
var addressCollection = db.get('address');
var cityCollection = db.get('city');
var countryCollection = db.get('country');

router.use(function timeLog(req, res, next) {
    console.log('Accessed Addresses URI Page at Time: ', new Date());
    next();
});

// Get the List of all addresses
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

            if (element.toUpperCase() === 'ADDRESS') {
                sort.address = order;
            }
            if (element.toUpperCase() === 'ADDRESS2') {
                sort.address2 = order;
            }
            if (element.toUpperCase() === 'DISTRICT') {
                sort.district = order;
            }
            if (element.toUpperCase() === 'POSTALCODE' || element.toUpperCase() === 'POSTAL_CODE') {
                sort.postal_code = order;
            }
            if (element.toUpperCase() === 'PHONE') {
                sort.phone = order;
            }
        });
    }

    if (!sort) {
        sort = {
            address_id: 1
        };
    }

    if (query.filter) {
        console.log(query.filter);
    }

    if (query.fields) {
        var order = 1;
        fields.address_id = order;
        var res = String(query.fields).trim();
        var length = res.length;
        res = res.substr(1, length - 2).split('||');
        res.forEach(function(element) {
            if (element.toUpperCase() === 'ADDRESS') {
                fields.address = order;
            }
            if (element.toUpperCase() === 'ADDRESS2') {
                fields.address2 = order;
            }
            if (element.toUpperCase() === 'DISTRICT') {
                fields.district = order;
            }
            if (element.toUpperCase() === 'CITY' || element.toUpperCase() === 'CITY_ID') {
                fields.city_id = order;
            }
            if (element.toUpperCase() === 'POSTALCODE' || element.toUpperCase() === 'POSTAL_CODE') {
                fields.postal_code = order;
            }
            if (element.toUpperCase() === 'PHONE') {
                fields.phone = order;
            }
        });
    }

    var count;
    async.waterfall(
        [
            function(callback) {
                addressCollection.count({}, callback);
            },
            function(addressCount, callback) {
                count = addressCount;
                var optionalParam = {
                    limit: limit,
                    skip: offset,
                    sort: sort,
                    fields: fields
                }
                addressCollection.find({}, optionalParam, callback);
            }
        ],
        function(err, results) {
            if (err) {
                return response.status(500).json(err);
            }
            else if (results) {
                return response.json(convert.fromAddressDB(results, true, offset, limit, count, query.sort, query.filter, query.fields));
            }
            else {
                return response.status(404).json(404);
            }
        }
    );
});

// GET, PUT, DELETE, POST of a Particular Address
router.get('/:id', function(request, response) {
    addressCollection.find({
        address_id: Number(request.params.id)
    }, {}, function(err, address) {
        if (err) {
            return response.status(500).json(err);
        }
        else if (address) {
            return response.json(convert.fromAddressDB(address));
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

    var address = convert.toCountryDB(request.body);

    if (address && address[0] && address[0]._id && address[0].address_id && !isNaN(address[0].address_id) && !isNaN(request.params.id) && Number(address[0].address_id) === Number(request.params.id)) {

        var temp = {};

        if (typeof(address[0].address) != undefined) temp.address = address[0].address;
        if (typeof(address[0].address2) != undefined) temp.address2 = address[0].address2;
        if (typeof(address[0].district) != undefined) temp.district = address[0].district;
        if (typeof(address[0].city_id) != undefined) temp.city_id = address[0].city_id;
        if (typeof(address[0].postal_code) != undefined) temp.postal_code = address[0].postal_code;
        if (typeof(address[0].phone) != undefined) temp.phone = address[0].phone;
        if (typeof(address[0].last_update) != undefined) temp.last_update = address[0].last_update;

        addressCollection.update({
            address_id: Number(request.params.id)
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
                customerCollection.count({
                    address_id: Number(request.params.id)
                }, callback);
            },
            function(count, callback) {
                if (count > 0) {
                    var err = new Error();
                    err.status = 403;
                    err.message = 'Unable to Delete the Address with AddressID: ' + Number(request.params.id) + ', ' + count + ' Customers have this Address as a reference';
                    return callback(err);
                }
                else {
                    addressCollection.remove({
                        address_id: Number(request.params.id)
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

router.get("/:id/city", function(request, response) {

    async.waterfall([
        function(callback) {
            addressCollection.find({
                address_id: Number(request.params.id)
            }, {}, callback);
        },
        function(address, callback) {
            if (address && address[0]) {
                cityCollection.find({
                    city_id: Number(address[0].city_id)
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
            return response.json(convert.fromCityDB(results));
        }
        else {
            return response.status(404).json(404);
        }
    });
});

router.get("/:id/city/country", function(request, response) {

    async.waterfall([
        function(callback) {
            addressCollection.find({
                address_id: Number(request.params.id)
            }, {}, callback);
        },
        function(address, callback) {
            if (address && address[0]) {
                cityCollection.find({
                    city_id: Number(address[0].city_id)
                }, {}, callback);
            }
            else {
                var err = new Error('Not Found');
                err.status = 404;
                return callback(err);
            }
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