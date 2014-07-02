/*
 * Serve JSON to our AngularJS client
 */
var https = require('https');
var http = require('http');

exports.name = function (req, res) {
  res.json({
  	name: 'Bob'
  });
};

exports.products = function (req, res) {

	console.log("Request Products from Oanda");

	var options = {
		host: 'api-fxpractice.oanda.com',
		//host: 'api-sandbox.oanda.com',
		path: '/v1/instruments?accountId=1851245',
		method: 'GET',
		headers: {"Authorization" : "Bearer c34187acf8e1eb607931073c08d05a78-e2152795bb7b34ba56148eec06c1ef7d"},
	};

	var responseData = "";

	var request = https.request(options, function(response){
		response.on("data", function(chunk){
			responseData += chunk.toString();
		});
		response.on("end", function(){
			res.end(responseData)
		});
	});
	request.end();
};