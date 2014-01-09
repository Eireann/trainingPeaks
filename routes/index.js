
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index');
};

exports.getGpsData = function(req, res){
	requestURL = "http://www.trainingpeaks.com/TPWebServices/REST/PublicWorkouts/Workout/X5PX7HY5N5Y4W5XA7DDRPTKELA";
	
	request = require('request');
	request({
		method: 'GET',
		url: requestURL,
		json: true }, 
		function (error, response, json) {
			if (!error && response.statusCode == 200) {
				console.log("JSON response from service: " + JSON.stringify(json));
				res.send(json);
			} else {
				console.log('got  ajax error trying to proxy request');
				res.send({error: "an error occured retrieving data"});
			}
		});
};
