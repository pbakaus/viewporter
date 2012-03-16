viewporter.forceDetection = true;

(function() {
	
	var scale = 1;

	if(/iPhone|iPad/.test(navigator.userAgent) && window.devicePixelRatio > 1) {
		scale /= window.devicePixelRatio;
	}

	document.write('<meta name="viewport" content="' + (navigator.userAgent.indexOf("Android") > -1 ? 'target-densitydpi=device-dpi,' : '') + 'initial-scale=' + scale + ',maximum-scale=' + scale + '" />');

})();