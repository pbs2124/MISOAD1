var express = require('express');
var router = express.Router();
var convert = require('./../utilities/converters.js');

router.use(function timeLog(req, res, next) {
	console.log('Accessed Customers URI Page at Time: ', new Date());
	next();
});

// Get the List of all customers
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

			if (element.toUpperCase() === 'LASTNAME') {
				sort.last_name = order;
			}
			if (element.toUpperCase() === 'FIRSTNAME') {
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

	var collection = request.db.get('customer');

	collection.count({}, function(err, count) {

		console.log("customer count: " + count);

		if (err) {
			console.error(err);
			return response.status(500).json(err);
		}

		collection.find({}, {
			limit: limit,
			skip: offset,
			sort: sort
		}, function(err, customers) {
			if (err) {
				return response.status(500).json(err);
			}
			else if (customers) {
				return response.json(convert.fromCustomerDB(customers, true, offset, limit, count, query.sort, query.filter));
			}
			else {
				return response.status(404).json(404);
			}
		});
	});

});

// GET, PUT, DELETE, POST of a Particular Customer
router.get('/:id', function(request, response) {
	var collection = request.db.get('customer');
	collection.find({
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

router.get("/:id/address", function(request, response) {
	var customerCollection = request.db.get('customer');
	var addressCollection = request.db.get('address');
	customerCollection.find({
		customer_id: Number(request.params.id)
	}, {}, function(err, customer) {
		if (err) {
			return response.status(500).json(err);
		}
		else if (customer[0]) {
			addressCollection.find({
				address_id: Number(customer[0].address_id)
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
		}
		else {
			return response.status(404).json(404);
		}
	});
});

router.put('/:id', function(req, res) {
	var db = req.db;
	var collection = db.get('customer');
	console.log("Inside put");

	if (!req.body) {
		return res.send(400);
	} // 6

	var id = req.params.id;
	console.log(id);

	if (!Number(id)) {
		return res.send("Invalid query parameters");
	}

	/*	{ "_id" : ObjectId("54d7db0f89dc3223d9000552"), "customer_id" : 50, "store_id" :
 	1, "first_name" : "DIANE", "last_name" : "COLLINS", "email" : "DIANE.COLLINS@sa
	kilacustomer.org", "address_id" : 54, "active" : true, "create_date" : ISODate("
	2006-02-15T03:04:36Z"), "last_update" : ISODate("2006-02-15T09:57:20Z") }
	> */

	//Get the other params from the query. Should get a list of query parameters that we will take
	//first_name, last_name, email, active, address_id, last_update(auto generated)
	collection.find({
		customer_id: Number(id)
	}, {}, function(e, data) {
		if (e) {
			return res.send(500, e);
		} // 1, 2

		console.log("result of findbyid i.e. data returned ", data);
		if (!data) {
			console.log("Inside !data");
			return res.send(404);
		} // 3


		//console.log("Before update");
		var update = {};
		if (req.body.first_name != undefined)
			update['first_name'] = req.body.first_name;
		if (req.body.last_name != undefined)
			update['last_name'] = req.body.last_name;
		if (req.body.email != undefined)
			update['email'] = req.body.email;
		if (req.body.active != undefined)
			update['active'] = req.body.active;
		update['last_update'] = new Date().toISOString();
		if (req.body.address_id != undefined) {
			//Continue updating only if the city id mentioned is valid in 'city' collection 
			var addrColl = db.get('address');
			addrColl.count({
				address_id: Number(req.body.address_id)
			}, function(err, count) {
				if (err || count === 0) {
					return res.send(404, err);
				}

				console.log("Found the object: ", count);
				update['address_id'] = req.body.address_id;
				UpdateDB(collection, update, res, id);
				res.send("Update succeeded");
			});
		}
		else //In case city_id not found, update other values
		{
			UpdateDB(collection, update, res, id);
			res.send("Updated succeeded");
		}
	});
});

function getFilterString(query) {
	var query = query.replace("||", "$or");
	query = query.replace("&&", "$and");
	console.log(query);

	var arr = query.split("$or");

}

function UpdateDB(collection, update, res, id) {
	console.log(update);

	collection.update({
			customer_id: Number(id)
		}, {
			$set: update
		},
		function(err) {
			if (err) {
				return res.send(500, err);
			}

			// Now we can get the order back
			// and see that it's updated
			collection.find({
				customer_id: Number(id)
			}, function(err, o) {
				if (err) {
					return res.send(500, err);
				}
				console.log("Found the object: ", o);
			});
		});

	return;
	//return response.json(convert.toCustomerDB(request.body));
}

//Delete one customer
router.delete('/:CustId', function(req, res) {
	var db = req.db;
	var collection = db.get('customer');
	var id = parseInt(req.params.CustId);

	collection.remove({
		customer_id: id
	}, function(err, todo) {
		if (err) {
			res.end(err);
		}
		else
			res.end("deleted");
	});
});

//Create one customer
router.post('/', function(req, res) {
	var db = req.db;
	var addCollection = db.get('address');
	var custCollection = db.get('customer');
	var countryCollection = db.get('country');
	var cityCollection = db.get('city');
	//Find address
	countryCollection.find({
		country: req.body.data.address.city.country

	}, {}, function(e, data) {

	}, function(err, habit) {
		if (err) {
			res.send(err);
		}
		else {
			//Find city
			cityCollection.find({
				address: Number(req.body.address_id),
				address2: '',
				district


			}, {}, function(e, data) {

			}, function(err, habit) {
				if (err) {
					res.send(err);
				}
				else {
					//Find country
					addCollection.find({
						address: Number(req.body.address_id),
						address2: ''

					}, {}, function(e, data) {

					}, function(err, habit) {
						if (err) {
							res.send(err);
						}
						else {
							//Insert new record
							req.body.customer_id = 2; //TODO: Add auto-increment logic.
							newCutomerData = convert.toCustomerDB(req.body);
							custCollection.save(newCustomerData);
						}
					});
				}
			});
		}
	});
});

module.exports = router;