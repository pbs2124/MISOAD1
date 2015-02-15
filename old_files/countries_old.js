var express = require('express');

var router = express.Router();


/* Get All Cities */
router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('country');
    collection.find({},{},function(e,coun){
    	  res.writeHead(200, {'Content-Type': 'application/json'}); // Sending data via json
		  var str='['; 
		  coun.forEach(function(country) {
			  str = str + '{ "country" : "' + country.country + '"},' +'\n';
		  });
		  str = str.trim();
		  str = str.substring(0,str.length-1);
		  str = str + ']';	
		  res.end(str);
    });
});


/*
> db.country.find({country_id: 50})
{ "_id" : ObjectId("54d7db0e89dc3223d90004e5"), "country_id" : 50, "country" : "
Japan", "last_update" : ISODate("2006-02-15T09:44:00Z") }
*/


router.put('/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('address');
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
    //country, last_update(auto generated)
    collection.find({country_id: Number(id)}, {},  function(e,data){  
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
        if (req.body.country != undefined)
            update['country'] = req.body.country;
        update['last_update'] = new Date().toISOString();

        UpdateDB(collection, update, res, id);
        res.send("Update succeeded");

    });
}); 

function UpdateDB(collection, update, res, id)
{
    console.log(update);

    collection.update(
        { country_id: Number(id) },
        { $set: update },
        function(err) {
            if (err) {
                return res.send(500, err);
            }

            // Now we can get the order back
            // and see that it's updated
            collection.find({
                country_id: Number(id)
            }, function(err, o) {
                if (err) {
                    return res.send(500, err);
                }
                console.log("Found the object: ", o);
            });
        });

        return;
}

//Delete one country
router.delete('/:CountryId', function(req, res){
    var db = req.db;
    var collection = db.get('country');
    var id = parseInt(req.params.CountryId);
    collection.remove({
        country_id : id
    }, function(err, todo){
        if(err){
            res.end(err);
        }
        else
        	res.end("deleted");
    });
});

module.exports = router;