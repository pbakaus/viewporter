var log = function() {
	$("#viewporter").append("<p>"+Array.prototype.slice.call(arguments).join(' ')+"</p>");
};

var debug = function() {
	
	log('landscape:', viewporter.isLandscape(), '('+window.orientation+')');

	$('#viewporter-debug-width').text(window.innerWidth);
	$('#viewporter-debug-height').text(window.innerHeight);
	$('#viewporter-debug-useragent').text(navigator.userAgent);
	
};

$(window).bind(viewporter.ACTIVE ? 'viewportready viewportchange' : 'load', function() {
	debug();
});