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
	top: 90,
	left: 190,
	width: 430,
	height: 540
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
	page.sendEvent('mousemove', 0, 0);
});

page.onLoadFinished = function() {
	setTimeout(function() {
		page.evaluate(function() {
	    $('.poem__line, [class^="poem__line--"], [class*=" poem__line--"]').removeClass("active");
			$('.poem__line, [class^="poem__line--"], [class*=" poem__line--"]').css("font-size", "0.8rem");
			$('.poem__line, [class^="poem__line--"], [class*=" poem__line--"]').css("line-height", "0.6rem");
			$('.share-buttons-wrapper').css("display", "none");
	  });
		page.render('screenshot-' + poemId + '.png');
		phantom.exit();
	}, 2000);

}