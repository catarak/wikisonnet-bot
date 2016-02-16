var Twit = require('twit');
var fs = require('fs');
var request = require('request');
var slimerjs = require('slimerjs');
var path = require('path');
var childProcess = require('child_process');
var config = require("./config.js")();

var binPath = "xvfb-run";
// var binPath = slimerjs.path;
var childArgs = [
	slimerjs.path,
  path.join(__dirname, 'slimerjs-poem-image.js'),
  '--ignore-ssl-errors=yes',
  '--wikisonnet-url=' + config.wikisonnet_url
]


var twitterConfig = JSON.parse(fs.readFileSync('twitter-config.json', 'utf8'));
var T = new Twit(twitterConfig);

var stream = T.stream('statuses/filter', { track: 'wikisonnet' });

stream.on('tweet', function (tweet) {
	if (tweet.entities.user_mentions[0].screen_name === 'wikisonnet') {
		console.log("Got tweet: " + tweet.text);
		//tweet.text get the rest of the text, send it to api
		//parse query as wikipedia page
		//save user to obj
		//159.203.110.230:8000 for production
		var requestor = tweet.user.screen_name;
		var wikiQuery = tweet.text.slice(tweet.entities.user_mentions[0].indices[1]);
		request({
			url: "https://en.wikipedia.org/w/api.php",
			method: 'GET',
			qs: {
				action: 'opensearch',
				limit: '2',
				format: 'json',
				search: wikiQuery
			},
		},
		function(err, response, body) {
			if(err) { console.log(err); return; }
			console.log(JSON.parse(response.body)[1]);
			if (JSON.parse(response.body)[1].length === 0) {
				console.log("Invalid page.");
				return;
			}
			console.log("Got wikipedia page: " + JSON.parse(response.body)[1][0]);
			var poemTitle = JSON.parse(response.body)[1][0];
			request({
				//format=json&action=query&prop=categories&titles=Madonna
				url: "https://en.wikipedia.org/w/api.php",
				method: 'GET',
				qs: {
					action: 'query',
					format: 'json',
					prop: 'categories',
					titles: poemTitle
				},
			},
			function(err, categoryResponse, body) {
				var body = JSON.parse(categoryResponse.body);
				var key = Object.keys(body.query.pages)[0];
				var categories = body.query.pages[key].categories;
				categories.forEach(function(category) {
					if (category.title.match(/(d|D)isambiguation/)) {
						poemTitle = JSON.parse(response.body)[1][1]
					}
				});
				request({
					url: config.wikisonnet_api_url + "/api/v2/poems",
					method: 'POST',
					form: {
						poemTitle: poemTitle,
						twitterHandle: requestor
					}
				},
				function(err, poemResponse) {
					if(err) { console.log(err); return; }
					console.log("Got poem from API: " + poemResponse);
					var body = JSON.parse(poemResponse.body);
					childArgs.push("--poem-id=" + body.id)
					if (body.complete) {
						var child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
						  console.log(err);
						  console.log(stderr);
						  console.log(stdout);
						});

						child.on('close', function(code) {
						  var b64content = fs.readFileSync('./screenshot-' + body.id + '.png', { encoding: 'base64' });

						  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
								var mediaIdStr = data.media_id_string;
								var status = '.@' + requestor + ', here is your poem about ' + poemTitle + '. Read more at ' + config.wikisonnet_url + '/poems/' + body.id;
							  var params = { status: status, media_ids: [mediaIdStr] }

							  T.post('statuses/update', params, function (err, data, response) {
							    console.log(data);
							    //delete screenshot from filesystem
							    fs.unlink('./screenshot-' + body.id + '.png');
							  });
						  });
						});
					}
					else {
						setTimeout(getPoem.bind(this, body.id, poemTitle, requestor), 1000);
					}
				});
			});
		});
	}
});

function getPoem(poemId, poemTitle, requestor) {
	request({
		url: config.wikisonnet_api_url + "/api/v2/poems/" + poemId,
		method: 'GET'
	},
	function(err, response) {
		if(err) { console.log(err); return; }
		var body = JSON.parse(response.body);
		if (body.complete) {
			//do all of the posting stuff.
			var child = childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
			  console.log(err);
			  console.log(stderr);
			  console.log(stdout);
			});

			child.on('close', function(code) {
			  var b64content = fs.readFileSync('./screenshot-' + body.id + '.png', { encoding: 'base64' });

			  T.post('media/upload', { media_data: b64content }, function (err, data, response) {
					var mediaIdStr = data.media_id_string;
					var status = '.@' + requestor + ', here is your poem about ' + poemTitle + '. Read more at ' + config.wikisonnet_url + '/poems/' + body.id;
				  var params = { status: status, media_ids: [mediaIdStr] }

				  T.post('statuses/update', params, function (err, data, response) {
				    console.log(data);
				    //delete screenshot from filesystem
				    fs.unlink('./screenshot-' + body.id + '.png');
				  });
			  });
			});
		}
		else {
			setTimeout(getPoem.bind(this, body.id, poemTitle, requestor), 1000);
		}
	});
}
