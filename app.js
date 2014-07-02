
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  https = require('https'),
  path = require('path');

var app = module.exports = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

// production only
if (app.get('env') === 'production') {
  // TODO
};


/**
 * Routes
 */

// serve index and view partials
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);
app.get('/api/products', api.products);


// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

var tick;
var currentMarket = {};
var currentSubscriptions = ["EUR_USD"];
var subscriptionRequest;


function pricingSubscribe(){
	var _getSubscriptionPath = function(){
		var basePath = '/v1/prices?accountId=1851245&instruments=';

		return basePath + currentSubscriptions.join();
	};

	var options = {
		host: 'stream-fxpractice.oanda.com',
		//host: 'stream-sandbox.oanda.com',
		//todo: modify this path based on union of all connected client subscriptions
		path: _getSubscriptionPath(),
		method: 'GET',
	};

	subscriptionRequest = https.request(options, function(response){

		response.on("data", function(chunk){
			var prices = chunk.toString()
			var pricesArray = prices.split("\n");

			for (var i in pricesArray) {

				var priceString = pricesArray[i];

				if(priceString.length >0) {
					console.log("about to try parse: **"+priceString+"**");
					try {
		  				var obj = JSON.parse(priceString);
	  					if(!obj.hasOwnProperty('heartbeat')){
	  						//add logic here now, although redundent
	  						if(currentMarket.hasOwnProperty(obj.instrument)){
								currentMarket[obj.instrument] = obj;
	  						}else{
								currentMarket[obj.instrument] = obj;
	  						}
	  						tick = obj;
	  					}
						}catch(err) {
							console.log("parse fail: **"+priceString+"**, skip this update");
						}
					}
			}
		});
		response.on("end", function(){
			console.log("Disconnected streaming request");
		});
	});

	subscriptionRequest.end();
}

//Naïve approach to adding subscription, will have to kill exisitng http request
function addStreamingSubscription(instrument){
	subscriptionRequest.end();
	currentSubscriptions.push(instrument);
	pricingSubscribe();
}

// Socket.io Communication
io.sockets.on('connection', function (socket) {
  socket.emit('send:name', {
    name: 'Shaun'
  });

  //make this object for all client markets;
  var 	last,
		subscriptions = ["EUR_USD"],
  		latestSent = {};

  socket.on('subscription:request', function(msg){
    console.log('received subscription request: ' + msg);

    //add some validation on msg here
    subscriptions = JSON.parse(msg);

    for(var i=0;i<subscriptions.length;i++){
    	if(currentSubscriptions.indexOf(subscriptions[i]) === -1){
    		addStreamingSubscription(subscriptions[i]);
    	}
    }
  });

  setInterval(function(){
  	//Loop over each of the current socket user's subscriptions, check if the market has changed.
  	for(var i=0; i<subscriptions.length; i++){
  		var instrument = subscriptions[i];

		//Check if we have sent an update to the user for this product yet, if not then send one and update latestSent
  		if (!latestSent.hasOwnProperty(instrument) && currentMarket.hasOwnProperty(instrument)){
  			socket.emit('stream:'+instrument, currentMarket[instrument]);
  			latestSent[instrument] = currentMarket[instrument];
  			continue;
  		}

  		//As a tick has already been sent, check whether the current tick is different before sending.
  		if (currentMarket[instrument] !== latestSent[instrument]) {
  			socket.emit('stream:'+instrument, currentMarket[instrument]);
  			latestSent[instrument] = currentMarket[instrument];
  		}
  	}
  }, 0.001);
});

/**
 * Start Server
 */

server.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});

//Run initial Subscriptions
pricingSubscribe();
