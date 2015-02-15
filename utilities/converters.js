/**
 * New node file
 */
module.exports = {

	fromAddressDB: function(data, enable_links, offset, limit, totalCount, sort, filter, fields) {
		var json = JSON.parse(JSON.stringify(data));

		var modifiedJSON;

		if (enable_links) {
			modifiedJSON = {
				addresses: [],
				links: []
			};
		}
		else {
			modifiedJSON = {
				addresses: []
			};
		}

		json.forEach(function(address) {

			var temp = {
				"id": address._id,
				"address_id": address.address_id,
				"type": "address",
				"data": {
					"link": {
						"rel": "self",
						"href": "/addresses/" + address.address_id
					}
				}
			};

			if (address.address) temp.data.address = address.address;
			if (address.address2) temp.data.address2 = address.address2;
			if (address.district) temp.data.district = address.district;
			if (address.postal_code) temp.data.postalCode = address.postal_code;
			if (address.phone) temp.data.phone = address.phone;
			if (address.city_id) {
				if (!temp.data.city) {
					temp.data.city = {};
				}
				temp.data.city.city_id = address.city_id;
				if (!temp.data.city.link) {
					temp.data.city.link = {};
				}
				temp.data.city.link.rel = "city";
				temp.data.city.link.href = "/cities/" + address.city_id;
			}

			modifiedJSON.addresses.push(temp);

		});

		if (enable_links) {
			modifiedJSON = generatePaginationLinks('addresses', modifiedJSON, offset, limit, totalCount, sort, filter, fields);
		}
		return modifiedJSON;
	},

	fromCityDB: function(data, enable_links, offset, limit, totalCount, sort, filter, fields) {
		var json = JSON.parse(JSON.stringify(data));

		var modifiedJSON;

		if (enable_links) {
			modifiedJSON = {
				cities: [],
				links: []
			};
		}
		else {
			modifiedJSON = {
				cities: []
			};
		}

		json.forEach(function(city) {
			var temp = {
				"id": city._id,
				"city_id": city.city_id,
				"type": "city",
				"data": {
					"link": {
						"rel": "self",
						"href": "/cities/" + city.city_id
					}
				}
			};

			if (city.city) temp.data.city = city.city;
			if (city.country_id) {
				if (!temp.data.country) {
					temp.data.country = {};
				}
				temp.data.country.country_id = city.country_id;
				if (!temp.data.country.link) {
					temp.data.country.link = {};
				}
				temp.data.country.link.rel = "country";
				temp.data.country.link.href = "/countries/" + city.country_id;
			}

			modifiedJSON.cities.push(temp);
		});

		if (enable_links) {
			modifiedJSON = generatePaginationLinks('cities', modifiedJSON, offset, limit, totalCount, sort, filter, fields);
		}

		return modifiedJSON;
	},


	fromCountryDB: function(data, enable_links, offset, limit, totalCount, sort, filter, fields) {
		var json = JSON.parse(JSON.stringify(data));

		var modifiedJSON;

		if (enable_links) {
			modifiedJSON = {
				countries: [],
				links: []
			};
		}
		else {
			modifiedJSON = {
				countries: []
			};
		}

		json.forEach(function(country) {
			modifiedJSON.countries.push({
				"id": country._id,
				"country_id": country.country_id,
				"type": "country",
				"data": {
					"country": country.country,
					"link": {
						"rel": "self",
						"href": "/countries/" + country.country_id
					}
				}
			});
		});

		if (enable_links) {
			modifiedJSON = generatePaginationLinks('countries', modifiedJSON, offset, limit, totalCount, sort, filter, fields);
		}

		return modifiedJSON;
	},

	fromCustomerDB: function(data, enable_links, offset, limit, totalCount, sort, filter, fields) {
		var json = JSON.parse(JSON.stringify(data));

		var modifiedJSON;

		if (enable_links) {
			modifiedJSON = {
				customers: [],
				links: []
			};
		}
		else {
			modifiedJSON = {
				customers: []
			};
		}

		json.forEach(function(customer) {

			var temp = {
				"id": customer._id,
				"customer_id": customer.customer_id,
				"type": "customer",
				"data": {
					"link": {
						"rel": "self",
						"href": "/customers/" + customer.customer_id
					}
				}
			};

			if (customer.store_id) temp.data.store_id = customer.store_id;
			if (customer.last_name) {
				if (!temp.data.name) {
					temp.data.name = {};
				}
				temp.data.name.lastName = customer.last_name;
			}
			if (customer.first_name) {
				if (!temp.data.name) {
					temp.data.name = {};
				}
				temp.data.name.firstName = customer.first_name;
			}
			if (customer.email) temp.data.email = customer.email;
			if (customer.active) temp.data.active = customer.active;
			if (customer.address_id) {
				if (!temp.data.address) {
					temp.data.address = {};
				}
				temp.data.address.address_id = customer.address_id;
				if (!temp.data.address.link) {
					temp.data.address.link = {};
				}
				temp.data.address.link.rel = "address";
				temp.data.address.link.href = "/addresses/" + customer.address_id;
			}

			modifiedJSON.customers.push(temp);
		});

		if (enable_links) {
			modifiedJSON = generatePaginationLinks('customers', modifiedJSON, offset, limit, totalCount, sort, filter, fields);
		}

		return modifiedJSON;
	},

	toAddressDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.addresses.forEach(function(address) {

			var temp = {
				"address": address.data.address,
				"address2": address.data.address2,
				"district": address.data.district,
				"city_id": Number(address.data.city.city_id),
				"postal_code": address.data.postalCode,
				"phone": address.data.phone,
				"last_update": new Date()
			};

			if (address.id) {
				temp._id = address.id;
			}
			if (address.address_id) {
				temp.address_id = Number(address.address_id);
			}

			modifiedJSON.push(temp);
		});
		return modifiedJSON;
	},

	toCityDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.cities.forEach(function(city) {

			var temp = {
				"city": city.data.city,
				"country_id": city.data.country_id,
				"last_update": new Date()
			};

			if (city.id) {
				temp._id = city.id;
			}
			if (city.city_id) {
				temp.city_id = Number(city.city_id);
			}

			modifiedJSON.push(temp);
		});
		return modifiedJSON;
	},

	toCountryDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.countries.forEach(function(country) {

			var temp = {
				"country": country.data.country,
				"last_update": new Date()
			};

			if (country.id) {
				temp._id = country.id;
			}
			if (country.country_id) {
				temp.country_id = Number(country.country_id);
			}

			modifiedJSON.push(temp);
		});
		return modifiedJSON;
	},

	toCustomerDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.customers.forEach(function(customer) {

			var temp = {
				"store_id": customer.data.store_id,
				"first_name": customer.data.name.firstName,
				"last_name": customer.data.name.lastName,
				"email": customer.data.email,
				"address_id": Number(customer.data.address.address_id),
				"active": Boolean(customer.data.active),
				"create_date": new Date(),
				"last_update": new Date()
			};

			if (customer.id) {
				temp._id = customer.id;
			}

			if (customer.customer_id) {
				temp.customer_id = Number(customer.customer_id);
			}

			modifiedJSON.push(temp);
		});
		return modifiedJSON;
	}
};

function generatePaginationLinks(name, modifiedJSON, offset, limit, totalCount, sort, filter, fields) {
	var sortFilterTag = '';

	if (sort && filter) {
		sortFilterTag = '&sort=' + sort + '&filter=' + filter;
	}
	else if (sort) {
		sortFilterTag = '&sort=' + sort;
	}
	else if (filter) {
		sortFilterTag = '&filter=' + filter;
	}
	if(fields){
		sortFilterTag = sortFilterTag + '&fields=' + fields;
	}

	if (offset + limit >= totalCount) {
		modifiedJSON.links.push({
			"rel": "next",
			"href": ""
		});
	}
	else {
		modifiedJSON.links.push({
			"rel": "next",
			"href": "/" + name + "?offset=" + (offset + limit) + "&limit=" + limit + sortFilterTag
		});
	}

	// Logic for creating last link...
	var lastOffset = totalCount - limit;

	if (lastOffset <= 0) {
		modifiedJSON.links.push({
			"rel": "last",
			"href": "/" + name + "?offset=" + 0 + "&limit=" + limit + sortFilterTag
		});
	}
	else {
		modifiedJSON.links.push({
			"rel": "last",
			"href": "/" + name + "?offset=" + lastOffset + "&limit=" + limit + sortFilterTag
		});
	}

	if (offset == 0) {
		modifiedJSON.links.push({
			"rel": "prev",
			"href": ""
		});
	}
	else if (offset - limit <= 0) {
		modifiedJSON.links.push({
			"rel": "prev",
			"href": "/" + name + "?offset=" + 0 + "&limit=" + limit + sortFilterTag
		});
	}
	else {
		modifiedJSON.links.push({
			"rel": "prev",
			"href": "/" + name + "?offset=" + (offset - limit) + "&limit=" + limit + sortFilterTag
		});
	}

	modifiedJSON.links.push({
		"rel": "first",
		"href": "/" + name + "?offset=" + 0 + "&limit=" + limit + sortFilterTag
	});

	modifiedJSON.links.push({
		"rel": "self",
		"href": "/" + name + "?offset=" + offset + "&limit=" + limit + sortFilterTag
	});
	return modifiedJSON;
}