var page = require('webpage').create();

var url;
var system = require('system');
var fs = require('fs');

var args = system.args;
var poemId;

//2880x1800

page.viewportSize = {
	width: 1200,
	height: 900
};

page.clipRect = {
	top: 45,
	left: 125,
	width: 630,
	height: 750
};

page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36';

page.onConsoleMessage = function(msg) {
	console.log("console message: " + msg);
};

args.forEach(function(arg, i) {
	var argObj = arg.split("=");
	if (argObj[0] === "--poem-id") {
		poemId = argObj[1];
	}
	else if (argObj[0] === "--wikisonnet-url") {
		url = argObj[1] + "/poems/"
	}
});

page.open(url+poemId, function(status) {

});

page.onLoadFinished = function() {
	setTimeout(function() {
		page.render('screenshot-' + poemId + '.png');
		phantom.exit();
	}, 1000);

}