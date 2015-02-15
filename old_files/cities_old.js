var express = require('express');

var router = express.Router();


/* Get All Cities */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('city');
    collection.find({},{},function(e,city1){
    	  res.writeHead(200, {'Content-Type': 'application/json'}); // Sending data via json
		  var str='[';
		  city1.forEach(function(city) {
			  str = str + '{ "city" : "' + city.city + '"},' +'\n';
		  });
		  str = str.trim();
		  str = str.substring(0,str.length-1);
		  str = str + ']';	
		  res.end(str);
    });
});


/*
{ "_id" : ObjectId("54d7db0e89dc3223d90002bf"), "city_id" : 100, "city" : "Cam R
anh", "country_id" : 105, "last_update" : ISODate("2006-02-15T09:45:25Z") }
>
*/

router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('city');
    //console.log("Inside put");

    if(!req.body) { 
        return res.send(400); 
    } // 6

    var id = req.params.id;
    console.log(id);
    
    if (!Number(id)) {
    	return res.send("Invalid query parameters");
    }
    	
    //console.log('Helllo Worlld...!!!');
    //console.log(req.body.param2);
    

    //Get the other params from the query. Should get a list of query parameters that we will take
    //city, country_id, last_update(auto generated)
    collection.find({city_id: Number(id)}, {},  function(e,data){  
        if(e) { 
            return res.send(500, e); 
        } // 1, 2

        console.log("result of findbyid, before data check ", data);
        if(!data) { 
        	console.log("Inside !data");
            return res.send(404); 
        } // 3
        
        
        //console.log("Before update");
        var update = {};
        if (req.body.city != undefined)
            update['city'] = req.body.city;
        update['last_update'] = new Date().toISOString();
        if (req.body.country_id != undefined)
        {
            //Continue updating only if the city id mentioned is valid in 'city' collection 
            var countryColl = db.get('country');
            countryColl.count({
            		country_id: Number(req.body.country_id)
            	}, function (err, count) {
						if(err || count === 0) {
							return res.send(404, err);
						}
						console.log("Found the object: ",count);
						update['country_id'] = req.body.country_id;
						UpdateDB(collection, update, res, id);
						res.send("Update succeeded");
            });
        }
        else //In case city_id not found, update other values
        {
            UpdateDB(collection, update, res, id);
            res.send("Update succeeded");
        }
    });
});    
        
function UpdateDB(collection, update, res, id)
{
    console.log(update);

    collection.update(
        { city_id: Number(id) },
        { $set: update },
        function(err) {
            if (err) {
                return res.send(500, err);
            }

            // Now we can get the order back
            // and see that it's updated
            collection.find({
                city_id: Number(id)
            }, function(err, o) {
                if (err) {
                    return res.send(500, err);
                }
                console.log("Found the object: ", o);
            });
        });

        return;
}

//Delete one city
router.delete('/:CityId', function(req, res){
    var db = req.db;
    var collection = db.get('city');
    var id = parseInt(req.params.CityId);
    collection.remove({
        city_id : id
    }, function(err, todo){
        if(err){
            res.end(err);
        }
        else
        	res.end("deleted");
    });
});

module.exports = router;