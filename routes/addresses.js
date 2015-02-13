var express = require('express');
var router = express.Router();

// middleware specific to this router
router.use(function timeLog(req, res, next) {
    console.log('Accessed Addresses URI Page at Time: ', new Date());
    next();
});


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


router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('address');
    //console.log("Inside put");

    if (!req.body) {
        return res.send(400);
    } // 6

    var id = req.params.id;
    console.log(id);

    if (!Number(id)) {
        return res.send("Invalid query parameters");
    }

    //console.log('Helllo Worlld...!!!');
    //console.log(req.body.param2);


    /* Format of MongoDB storage for addresses
    { "_id" : ObjectId("54d7db0d89dc3223d9000014"), "address_id" : 20, "address" : "
360 Toulouse Parkway", "address2" : "", "district" : "England", "city_id" : 495,
 "postal_code" : "54308", "phone" : "949312333307", "last_update" : ISODate("200
6-02-15T09:45:30Z") }
	*/

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
        if (req.body.addresses.data.address != undefined)
            update['address'] = req.body.addresses.data.address;
        if (req.body.addresses.data.address2 != undefined)
            update['address2'] = req.body.addresses.data.address2;
        if (req.body.addresses.data.district != undefined)
            update['district'] = req.body.addresses.data.district;
        if (req.body.addresses.data.postal_code != undefined)
            update['postal_code'] = req.body.addresses.data.postal_code;
        if (req.body.addresses.data.phone != undefined)
            update['phone'] = req.body.addresses.data.phone;
        update['last_update'] = new Date().toISOString();
        if (req.body.addresses.data.city != undefined) {
            //Continue updating only if the city mentioned is valid in 'city' collection 
            var cityColl = db.get('city');
            cityColl.find({
                city: req.body.addresses.data.city
            }, function(err, city_res) {
                if (err) {
                    return res.send(404, err);
                }
                console.log("Found the object: ", city_res);
                if (city_res.city_id == undefined) {
                    UpdateCityCollection(collection, id, cityColl, res);
                }
                else {
                    update['city_id'] = city_res.city_id;
                    UpdateDB(collection, update, res, id);
                    res.send("Update succeeded");
                }
            });
        }
        else //In case city_id not found, update other values
        {
            UpdateDB(collection, update, res, id);
            res.send("Update succeeded");
        }
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

function UpdateCityCollection(collection, id, cityColl, res) {
    var cityUpdate = {
        city: res.body.addresses.data.city
    }
    console.log(cityUpdate);

    var options = {
            "limit": 1,
            "sort": ['city_id', 'desc']
        }
        //Find the next id for city and update the new city there
    cityColl.find({}, options,
        function(err, city_res) {
            if (err) {
                return res.send(404, err);
            }

            cityColl.update({
                    city_id: Number(city_res.city_id + 1)
                }, {
                    $set: cityUpdate
                },
                function(err) {
                    if (err) {
                        return res.send(500, err);
                    }

                    update['city_id'] = city_res.city_id;
                    UpdateDB(collection, update, res, id);
                    res.send("Update succeeded");
                });
        });
    return;
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