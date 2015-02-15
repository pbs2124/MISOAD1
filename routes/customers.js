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
	console.log('Accessed Customers URI Page at Time: ', new Date());
	next();
});

// Get the List of all customers
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

			if (element.toUpperCase() === 'LASTNAME' || element.toUpperCase() === 'LAST_NAME') {
				sort.last_name = order;
			}
			if (element.toUpperCase() === 'FIRSTNAME' || element.toUpperCase() === 'FIRST_NAME') {
				sort.first_name = order;
			}
			if (element.toUpperCase() === 'EMAIL') {
				sort.email = order;
			}
		});
	}

	if (!sort) {
		sort = {
			customer_id: 1
		};
	}

	if (query.filter) {

		console.log(query.filter);

		var res = String(query.filter).trim();
		var queryString = getFilterString(res);
	}

	if (query.fields) {
		var order = 1;
		fields.customer_id = order;
		var res = String(query.fields).trim();
		var length = res.length;
		res = res.substr(1, length - 2).split('||');
		res.forEach(function(element) {
			if (element.toUpperCase() === 'LASTNAME' || element.toUpperCase() === 'LAST_NAME') {
				fields.last_name = order;
			}
			if (element.toUpperCase() === 'FIRSTNAME' || element.toUpperCase() === 'FIRST_NAME') {
				fields.first_name = order;
			}
			if (element.toUpperCase() === 'EMAIL') {
				fields.email = order;
			}
			if (element.toUpperCase() === 'STORE' || element.toUpperCase() === 'STORE_ID') {
				fields.store_id = order;
			}
			if (element.toUpperCase() === 'ACTIVE') {
				fields.active = order;
			}
			if (element.toUpperCase() === 'ADDRESS' || element.toUpperCase() === 'ADDRESS_ID') {
				fields.address_id = order;
			}
		});
	}

	var count;
	async.waterfall(
		[
			function(callback) {
				customerCollection.count({}, callback);
			},
			function(customerCount, callback) {
				count = customerCount;
				var optionalParam = {
					limit: limit,
					skip: offset,
					sort: sort,
					fields: fields
				};
				customerCollection.find({}, optionalParam, callback);
			}
		],
		function(err, results) {
			if (err) {
				console.log(err);
				return response.status(500).json(err);
			}
			else if (results) {
				console.log(results);
				return response.json(convert.fromCustomerDB(results, true, offset, limit, count, query.sort, query.filter, query.fields));
			}
			else {
				return response.status(404).json(404);
			}
		}
	);
});

// GET, PUT, DELETE, POST of a Particular Customer
router.get('/:id', function(request, response) {
	customerCollection.find({
		customer_id: Number(request.params.id)
	}, {}, function(err, customers) {
		if (err) {
			return response.status(500).json(err);
		}
		else if (customers) {
			return response.json(convert.fromCustomerDB(customers));
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

	var customer = convert.toCustomerDB(request.body);

	if (customer && customer[0] && customer[0]._id && customer[0].customer_id && !isNaN(customer[0].customer_id) && !isNaN(request.params.id) && Number(customer[0].customer_id) === Number(request.params.id)) {

		var temp = {};

		if (typeof(customer[0].store_id) != undefined) temp.store_id = customer[0].store_id;
		if (typeof(customer[0].first_name) != undefined) temp.first_name = customer[0].first_name;
		if (typeof(customer[0].last_name) != undefined) temp.last_name = customer[0].last_name;
		if (typeof(customer[0].email) != undefined) temp.email = customer[0].email;
		if (typeof(customer[0].address_id) != undefined) temp.address_id = customer[0].address_id;
		if (typeof(customer[0].active) != undefined) temp.active = customer[0].active;
		if (typeof(customer[0].last_update) != undefined) temp.last_update = customer[0].last_update;

		customerCollection.update({
			customer_id: Number(request.params.id)
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
		customerCollection.remove({
			customer_id: Number(request.params.id)
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

router.get("/:id/address", function(request, response) {

	async.waterfall([
		function(callback) {
			customerCollection.find({
				customer_id: Number(request.params.id)
			}, {}, callback);
		},
		function(customer, callback) {
			if (customer && customer[0]) {
				addressCollection.find({
					address_id: Number(customer[0].address_id)
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
			return response.json(convert.fromAddressDB(results));
		}
		else {
			return response.status(404).json(404);
		}
	});
});


router.get("/:id/address/city", function(request, response) {

	async.waterfall([
		function(callback) {
			customerCollection.find({
				customer_id: Number(request.params.id)
			}, {}, callback);
		},
		function(customer, callback) {
			if (customer && customer[0]) {
				addressCollection.find({
					address_id: Number(customer[0].address_id)
				}, {}, callback);
			}
			else {
				var err = new Error('Not Found');
				err.status = 404;
				return callback(err);
			}
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

router.get("/:id/address/city/country", function(request, response) {

	async.waterfall([
		function(callback) {
			customerCollection.find({
				customer_id: Number(request.params.id)
			}, {}, callback);
		},
		function(customer, callback) {
			if (customer && customer[0]) {
				addressCollection.find({
					address_id: Number(customer[0].address_id)
				}, {}, callback);
			}
			else {
				var err = new Error('Not Found');
				err.status = 404;
				return callback(err);
			}
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

function getFilterString(query) {
	var query = query.replace("||", "$or");
	query = query.replace("&&", "$and");
	console.log(query);

	var arr = query.split("$or");

};

// //Create one customer
// router.post('/', function(req, res) {
// 	var db = req.db;
// 	var addCollection = db.get('address');
// 	var custCollection = db.get('customer');
// 	var countryCollection = db.get('country');
// 	var cityCollection = db.get('city');
// 	//Find address
// 	countryCollection.find({
// 			country: req.body.data.address.city.country
// 		}, {},

// 		function(e, data) {

// 		},
// 		function(err, habit) {
// 			if (err) {
// 				res.send(err);
// 			}
// 			else {
// 				//Find city
// 				cityCollection.find({
// 					address: Number(req.body.address_id),
// 					address2: '',
// 					district: ''
// 				}, {}, function(e, data) {

// 				}, function(err, habit) {
// 					if (err) {
// 						res.send(err);
// 					}
// 					else {
// 						//Find country
// 						addCollection.find({
// 							address: Number(req.body.address_id),
// 							address2: ''

// 						}, {}, function(e, data) {

// 						}, function(err, habit) {
// 							if (err) {
// 								res.send(err);
// 							}
// 							else {
// 								//Insert new record
// 								req.body.customer_id = 2; //TODO: Add auto-increment logic.
// 								newCutomerData = convert.toCustomerDB(req.body);
// 								custCollection.save(newCustomerData);
// 							}
// 						});
// 					}
// 				});
// 			}
// 		});
// });


module.exports = router;