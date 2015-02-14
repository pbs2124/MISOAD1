var express = require('express');
var router = express.Router();
var convert = require("./../utilities/converters.js");

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Accessed Addresses URI Page at Time: ', new Date());
    next();
});

/* Format of MongoDB storage for addresses
    { "_id" : ObjectId("54d7db0d89dc3223d9000014"), "address_id" : 20, "address" : "
360 Toulouse Parkway", "address2" : "", "district" : "England", "city_id" : 495,
 "postal_code" : "54308", "phone" : "949312333307", "last_update" : ISODate("200
6-02-15T09:45:30Z") }
*/

/* Get All Addresses. */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('address');
    collection.find({}, {}, function(e, addr) {
        res.writeHead(200, {
            'Content-Type': 'application/json'
        }); // Sending data via json
        var str = '[';
        addr.forEach(function(address) {
            str = str + '{ "district" : "' + address.district + '"},' + '\n';
        });
        str = str.trim();
        str = str.substring(0, str.length - 1);
        str = str + ']';
        res.end(str);
    });
});


router.put('/:AddressId', function(req, res) {
    var db = req.db;
    var collection = db.get('address');
    //console.log("Inside put");

    if (!req.body) {
        return res.send(400);
    } // 6

    var id = req.params.AddressId;
    console.log(id);

    if (!Number(id)) {
        return res.send("Invalid query parameters");
    }

    //console.log('Helllo Worlld...!!!');
    //console.log(req.body.param2);

    //Get the other params from the query. Should get a list of query parameters that we will take
    //address, address2, district, postal code, city_id, phone, last_update(auto generated)
    collection.find({
        address_id: Number(id)
    }, {}, function(e, data) {
        if (e) {
            return res.send(500, e);
        } // 1, 2

        console.log("result of findbyid, before data check ", data);
        if (!data) {
            console.log("Inside !data");
            return res.send(404);
        } // 3


        //console.log("Before update");
        var update = {};
        if (req.body.addresses[0].data.address != undefined)
            update['address'] = req.body.addresses[0].data.address;
        if (req.body.addresses[0].data.address2 != undefined)
            update['address2'] = req.body.addresses[0].data.address2;
        if (req.body.addresses[0].data.district != undefined)
            update['district'] = req.body.addresses[0].data.district;
        if (req.body.addresses[0].data.postal_code != undefined)
            update['postal_code'] = req.body.addresses[0].data.postal_code;
        if (req.body.addresses[0].data.phone != undefined)
            update['phone'] = req.body.addresses[0].data.phone;
        update['last_update'] = new Date().toISOString();
        if (req.body.addresses[0].data.country != undefined) {
            //In case city_id not found, check for country_id and update its value, else update other values
            UpdateCountryCollection(req.body.addresses[0].data.country, collection, db, res);
            //update['country'] = country_id;
        }

        if (req.body.addresses[0].data.city != undefined) {
            //Continue updating only if the city mentioned is valid in 'city' collection 
            var city_id = UpdateCityCollection(req.body.addresses[0].data.city, country_id, db, res);
            update['city'] = city_id;
        }

        UpdateDB(collection, update, res, id);
        res.send("Update succeeded");
    });
});

function UpdateDB(collection, update, res, id) {
    console.log(update);

    collection.update({
            address_id: Number(id)
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
                address_id: Number(id)
            }, function(err, o) {
                if (err) {
                    return res.send(500, err);
                }
                console.log("Found the object: ", o);
            });
        });

    return;
}

function UpdateCityCollection(city, country_id, db, res) {
    var cityColl = db.get('city');
    cityColl.find({
        city: city
    }, function(err, city_res) {
        if (err) {
            return res.send(404, err);
        }
        console.log("Found the city object: ", city_res);

        if (city_res.city_id != undefined) {
            return city_res.city_id;
        }
        else {
            var cityUpdate = {
                city: city,
                country_id: country_id
            }

            var options = {
                "limit": 1,
                "sort": ['city_id', 'desc']
            }

            //Find the next id for city and update the new city there
            cityColl.find({}, options,
                function(err, city_res2) {
                    if (err) {
                        return res.send(404, err);
                    }

                    var city_id = city_res2.city_id + 1;
                    cityUpdate['city_id'] = city_id;
                    cityUpdate['last_update'] = new Date().toISOString();
                    var newCityData = convert.toCityDB(cityUpdate); //should check how to add _id field
                    cityColl.save(newCityData);
                    return city_id;
                });
        }
    });
}

function UpdateCountryCollection(country, addrColl, db, res) {
    var countryColl = db.get('country');

    countryColl.find({
        country: country
    }, function(err, country_res) {
        if (err) {
            return res.send(404, err);
        }
        console.log("Found the object: ", country_res);

        //Update the country collection
        if (country_res.country_id == undefined) {
            var countryUpdate = {
                country: country
            }
            var options = {
                "limit": 1,
                "sort": ['country_id', 'desc']
            }

            //Find the next id for country and update the new country there
            countryColl.find({}, options,
                function(err, country_res2) {
                    if (err) {
                        return res.send(404, err);
                    }
                    var country_id = country_res2.country_id + 1;
                    countryUpdate['country_id'] = country_id;
                    countryUpdate['last_update'] = new Date().toISOString();
                    var newCountryData = convert.toCountryDB(countryUpdate); //should check how to add _id field
                    countryColl.save(newCountryData);
                    
                    update['country_id'] = country_id;
                    
                    //Update the city value if present
                    return country_id;
                });
        }
    });
}



//Delete one address
router.delete('/:AddressId', function(req, res) {
    var db = req.db;
    var collection = db.get('address');
    var id = parseInt(req.params.AddressId);
    collection.remove({
        address_id: id
    }, function(err, todo) {
        if (err) {
            res.end(err);
        }
        else
            res.end("deleted");
    });
});

module.exports = router;