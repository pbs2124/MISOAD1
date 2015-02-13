/**
 * New node file
 */
module.exports = {

	fromAddressDB: function(data, enable_links, offset, limit, totalCount,
		sort, filter) {
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
			modifiedJSON.addresses.push({
				"id": address._id,
				"address_id": address.address_id,
				"type": "address",
				"data": {
					"address": address.address,
					"address2": address.address2,
					"district": address.district,
					"city": {
						"link": {
							"rel": "city",
							"href": "../cities/" + address.city_id
						}
					},
					"postalCode": address.postalCode,
					"phone": address.phone,
					"link": {
						"rel": "self",
						"href": "../addresses/" + address.address_id
					}
				}
			});
		});

		if (enable_links) {
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

			if (offset + limit >= totalCount) {
				modifiedJSON.links.push({
					"rel": "next",
					"href": ""
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "next",
					"href": "../addresses?offset=" + (offset + limit) + "&limit=" + limit + sortFilterTag
				});
			}

			// Logic for creating last link...
			var lastOffset = totalCount - limit;

			if (lastOffset <= 0) {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../addresses?offset=" + lastOffset + "&limit=" + limit + sortFilterTag
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
					"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "prev",
					"href": "../addresses?offset=" + (offset - limit) + "&limit=" + limit + sortFilterTag
				});
			}

			modifiedJSON.links.push({
				"rel": "first",
				"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
			});

			modifiedJSON.links.push({
				"rel": "self",
				"href": "../addresses?offset=" + offset + "&limit=" + limit + sortFilterTag
			});
		}

		return modifiedJSON;
	},

	fromCityDB: function(data, enable_links, offset, limit, totalCount,
		sort, filter) {
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
			modifiedJSON.addresses.push({
				"id": city._id,
				"city_id": city.city_id,
				"type": "city",
				"data": {
					"city": city.city,
					"country": {
						"link": {
							"rel": "country",
							"href": "../countries/" + city.country_id
						}
					},
					"link": {
						"rel": "self",
						"href": "../cities/" + city.city_id
					}
				}
			});
		});

		if (enable_links) {
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

			if (offset + limit >= totalCount) {
				modifiedJSON.links.push({
					"rel": "next",
					"href": ""
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "next",
					"href": "../addresses?offset=" + (offset + limit) + "&limit=" + limit + sortFilterTag
				});
			}

			// Logic for creating last link...
			var lastOffset = totalCount - limit;

			if (lastOffset <= 0) {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../addresses?offset=" + lastOffset + "&limit=" + limit + sortFilterTag
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
					"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "prev",
					"href": "../addresses?offset=" + (offset - limit) + "&limit=" + limit + sortFilterTag
				});
			}

			modifiedJSON.links.push({
				"rel": "first",
				"href": "../addresses?offset=" + 0 + "&limit=" + limit + sortFilterTag
			});

			modifiedJSON.links.push({
				"rel": "self",
				"href": "../addresses?offset=" + offset + "&limit=" + limit + sortFilterTag
			});
		}

		return modifiedJSON;
	},


	fromCountryDB: function(data, enable_links, offset, limit, totalCount,
		sort, filter) {
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
			modifiedJSON.addresses.push({
				"id": country._id,
				"country_id": country.country_id,
				"type": "country",
				"data": {
					"country": country.country,
					"link": {
						"rel": "self",
						"href": "../countries/" + country.country_id
					}
				}
			});
		});

		if (enable_links) {
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

			if (offset + limit >= totalCount) {
				modifiedJSON.links.push({
					"rel": "next",
					"href": ""
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "next",
					"href": "../countries?offset=" + (offset + limit) + "&limit=" + limit + sortFilterTag
				});
			}

			// Logic for creating last link...
			var lastOffset = totalCount - limit;

			if (lastOffset <= 0) {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../countries?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../countries?offset=" + lastOffset + "&limit=" + limit + sortFilterTag
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
					"href": "../countries?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "prev",
					"href": "../countries?offset=" + (offset - limit) + "&limit=" + limit + sortFilterTag
				});
			}

			modifiedJSON.links.push({
				"rel": "first",
				"href": "../countries?offset=" + 0 + "&limit=" + limit + sortFilterTag
			});

			modifiedJSON.links.push({
				"rel": "self",
				"href": "../countries?offset=" + offset + "&limit=" + limit + sortFilterTag
			});
		}

		return modifiedJSON;
	},

	fromCustomerDB: function(data, enable_links, offset, limit, totalCount,
		sort, filter) {
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
			modifiedJSON.customers.push({
				"id": customer._id,
				"customer_id": customer.customer_id,
				"type": "customer",
				"data": {
					"name": {
						"lastName": customer.last_name,
						"firstName": customer.first_name
					},
					"email": customer.email,
					"address": {
						"link": {
							"rel": "address",
							"href": "../addresses/" + customer.address_id
						}
					},
					"active": customer.active,
					"link": {
						"rel": "self",
						"href": "../customers/" + customer.customer_id
					}
				}
			});
		});

		if (enable_links) {
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

			if (offset + limit >= totalCount) {
				modifiedJSON.links.push({
					"rel": "next",
					"href": ""
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "next",
					"href": "../customers?offset=" + (offset + limit) + "&limit=" + limit + sortFilterTag
				});
			}

			// Logic for creating last link...
			var lastOffset = totalCount - limit;

			if (lastOffset <= 0) {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../customers?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "last",
					"href": "../customers?offset=" + lastOffset + "&limit=" + limit + sortFilterTag
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
					"href": "../customers?offset=" + 0 + "&limit=" + limit + sortFilterTag
				});
			}
			else {
				modifiedJSON.links.push({
					"rel": "prev",
					"href": "../customers?offset=" + (offset - limit) + "&limit=" + limit + sortFilterTag
				});
			}

			modifiedJSON.links.push({
				"rel": "first",
				"href": "../customers?offset=" + 0 + "&limit=" + limit + sortFilterTag
			});

			modifiedJSON.links.push({
				"rel": "self",
				"href": "../customers?offset=" + offset + "&limit=" + limit + sortFilterTag
			});
		}

		return modifiedJSON;
	},

	toAddressDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.addresses.forEach(function(address) {

			if (address.id) {
				modifiedJSON.push({"_id": address.id});
			}
			if (address.address_id) {
				modifiedJSON.push({"address_id": Number(address.address_id)});
			}

			modifiedJSON.push({
				"address": address.data.address,
				"address2": address.data.address2,
				"district": address.data.district,
				"city_id": Number(address.data.city.city_id),
				"postal_code": Boolean(address.data.postalCode),
				"phone": address.data.phone,
				"last_update": new Date()
			});
		});
		return modifiedJSON;
	},

	toCustomerDB: function(data) {
		var modifiedJSON = [];
		var json = JSON.parse(JSON.stringify(data));
		json.customers.forEach(function(customer) {
			if (customer.id) {
				modifiedJSON.push({
					"_id": customer.id
				});
			}

			if (customer.customer_id) {
				modifiedJSON.push({
					"customer_id": Number(customer.customer_id)
				});
			}

			modifiedJSON.push({
				"first_name": customer.data.name.firstName,
				"last_name": customer.data.name.lastName,
				"email": customer.data.email,
				"address_id": Number(customer.data.address.address_id),
				"active": Boolean(customer.data.active),
				"create_date": new Date(),
				"last_update": new Date()
			});
		});
		return modifiedJSON;
	}
};