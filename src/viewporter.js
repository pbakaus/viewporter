/*
 * Viewporter
 * http://github.com/zynga/viewporter
 *
 * Copyright 2011, Zynga Inc.
 * Licensed under the MIT License.
 * https://raw.github.com/zynga/viewporter/master/MIT-LICENSE.txt
 */
var viewporter;
(function() {

	// initialize private constants
	var DEFAULT_ROTATION_LANDSCAPE = false;

	// initialize viewporter object
	viewporter = {

		// constants
		ACTIVE: (('ontouchstart' in window) || (/webos/i).test(navigator.userAgent)),
		DEVICE_SUPPORTED: false,
		DEVICE_DENSITY: null,
		META_VIEWPORT_CONTENT: null,

		// settings
		settings: {
			maxDensity: 163 // this is iPhone non-retina, set to false for purist/always native
		},

		// methods
		isLandscape: function() {
			return (!DEFAULT_ROTATION_LANDSCAPE ?
				(window.orientation === 90 || window.orientation === -90)
				: (window.orientation === 0 || window.orientation === 180));
		},

		ready: function(callback) {
			window.addEventListener('viewportready', callback, false);
		}

	};

	// if we are on Desktop, no need to go further
	if (!viewporter.ACTIVE) {
		return;
	}

	// create private constructor with prototype..just looks cooler
	var _Viewporter = function() {

		var that = this;

		this.data = {};
		this.IS_ANDROID = /Android/.test(navigator.userAgent);

		// listen for document ready, then try to prepare the visual viewport and start firing custom events
		document.addEventListener('DOMContentLoaded', function() {

			// initialize viewporter
			that.computeViewportInformation();

			// set and update the meta viewport tag for the first time
			that.setMetaViewport();

			// scroll the shit away and fix the viewport!
			that.prepareVisualViewport();

			// listen for orientation change
			var cachedOrientation = window.orientation;
			window.addEventListener('orientationchange', function() {
				if(window.orientation != cachedOrientation) {
					that.computeViewportInformation();
					that.updateMetaViewport();
					that.prepareVisualViewport();
					cachedOrientation = window.orientation;
				}
			}, false);

		}, false);

	};

	_Viewporter.prototype = {

		computeViewportInformation: function() {

			// try to fetch a profile
			var profile = this.getProfile();

			 // Y U NO FOUND DEVICE?
			if(!profile) {
				return this.triggerWindowEvent('viewportunknown');
			}

			// find out if the device is landscape per default (i.e. the Motorola Xoom)
			DEFAULT_ROTATION_LANDSCAPE = profile ? profile.inverseLandscape : false;

			// initialize working variables
			var landscape = viewporter.isLandscape(),
				ppi = 0, ppiFactor = 1,
				width = !DEFAULT_ROTATION_LANDSCAPE ? screen.height : screen.width,
				height = !DEFAULT_ROTATION_LANDSCAPE ? screen.width : screen.height,
				scale = this.IS_ANDROID ? 1: 1 / window.devicePixelRatio,
				chromeHeight = 0, chromeWasPrescaled = false;

			// little property getter helper
			var _w = width, _h = height, _c = chromeHeight,
				computeProp = function(n) { return (typeof n == 'function' ? n(_w,_h,ppiFactor) : n); };

			// check if the ppi is higher than the max, normalize if it is
			ppi = typeof profile.ppi == 'function' ? profile.ppi() : profile.ppi;
			if(ppi) {
				viewporter.DEVICE_DENSITY = ppi;
				if(viewporter.settings.maxDensity && ppi > viewporter.settings.maxDensity) {
					ppiFactor *= viewporter.settings.maxDensity/ppi;
					scale = this.IS_ANDROID ? 1 : (scale / ppiFactor);
				}
			}

			// width and height, always scaled afterwards
			width = computeProp(profile.width) || width;
			height = computeProp(profile.height) || height;

			// chrome height, needs to be scaled in callback for iPhone only..
			if(profile.chromePrescale) {
				chromeHeight = computeProp(profile.chromePrescale);
				chromeWasPrescaled = true;
			} else {
				chromeHeight = computeProp(profile.chrome) || 0;
			}

			// specific orientation overrides
			var orientationOverride = profile[landscape ? 'landscape' : 'portrait'];
			if(orientationOverride) {
				width = computeProp(orientationOverride.width) || width;
				height = computeProp(orientationOverride.height) || height;
				chromeHeight = computeProp(orientationOverride.chrome) || chromeHeight || 0;
			}

			// save information
			this.data = {
				width: (landscape ? width : height) * ppiFactor,
				height: (landscape ? height : width) * ppiFactor,
				scale: scale,
				chromeHeight: chromeHeight * (chromeWasPrescaled ? 1 : ppiFactor)
			};

			viewporter.DEVICE_SUPPORTED = true;

		},

		prepareVisualViewport: function() {

			// in an interval, try scrolling the top shit away until the window height fits with the height I think should be the right height
			var that = this,
				currentHeight = window.innerHeight,
				iterationCount = 0,
				interval = window.setInterval(function() {

					// make the height of the document really large, so we actually have a chance to scroll the url bar away
					if(!viewporter.DEVICE_SUPPORTED) {
						that.maximizeDocumentElement();
					}

					// this tries to scroll away the top chrome
					window.scrollTo(0,1);

					// try to see if the best condition matches, otherwise timeout after 10 iterations (100ms)
					//$('body').append('<p>'+window.innerHeight+', '+that.data.chromeHeight+'</p>');
					if( (viewporter.DEVICE_SUPPORTED && ( Math.abs(window.innerHeight - Math.ceil(that.data.height - that.data.chromeHeight)) < 5 )) || (iterationCount > 10) ) {

						// clear the running checks
						clearInterval(interval);

						// reset the height of the document
						if(!viewporter.DEVICE_SUPPORTED) {
							//that.fixDocumentElement(window.innerHeight);
						}

						// let everyone know we're finally ready
						that.triggerWindowEvent(!that._firstUpdateExecuted ? 'viewportready' : 'viewportchange');
						that._firstUpdateExecuted = true;

					}

					iterationCount++;

				}, 10);

		},

		triggerWindowEvent: function(name) {
			var event = document.createEvent("Event");
			event.initEvent(name, false, false);
			window.dispatchEvent(event);
		},

		getProfile: function() {
			for(var searchTerm in viewporter.profiles) {
				if(new RegExp(searchTerm).test(navigator.userAgent)) {
					return viewporter.profiles[searchTerm];
				}
			}
			return null;
		},

		/*
		 * Meta viewport functionality
		 */

		maximizeDocumentElement: function() {
			document.documentElement.style.minHeight = '5000px';
		},

		fixDocumentElement: function(height) {
			document.documentElement.style.minHeight = ( height || (this.data.height - this.data.chromeHeight) )+'px';
			document.documentElement.style.minWidth = this.data.width+'px';
		},

		findMetaNode: function(name) {
			var meta = document.getElementsByTagName('meta');
			for (var i=0; i < meta.length; i++) {
				if(meta[i].getAttribute('name') == name) {
					return meta[i];
				}
			}
			return null;
		},

		setMetaViewport: function() {

			// create meta viewport tag (or reuse existing one)
			var node = this.findMetaNode('viewport') || document.createElement('meta');
			node.setAttribute('name', 'viewport');
			node.id = 'metaviewport';

			// update it for the first time
			this.updateMetaViewport(node);

			// append it to the page
			document.getElementsByTagName('head')[0].appendChild(node);

		},

		updateMetaViewport: function(node) {

			node = node || document.getElementById('metaviewport');

			var content = viewporter.DEVICE_SUPPORTED ? [
					'width=' + this.data.width,
					'height=' + (this.data.height - this.data.chromeHeight),
					'initial-scale=' + this.data.scale,
					'minimum-scale=' + this.data.scale,
					'maximum-scale=' + this.data.scale
				] : ['width=device-width', 'initial-scale=1', 'minimum-scale=1', 'maximum-scale=1'];

			// if we're on Android, we need to give the viewport a target density
			if(this.IS_ANDROID) {
				content.unshift('target-densityDpi='+(viewporter.DEVICE_DENSITY ? (viewporter.settings.maxDensity || 'device-dpi') : 'device-dpi'));
			}

			// apply viewport data
			viewporter.META_VIEWPORT_CONTENT = content.join(',');
			node.setAttribute('content', viewporter.META_VIEWPORT_CONTENT);

			if(viewporter.DEVICE_SUPPORTED) {
				this.fixDocumentElement();
			}

		}

	};

	// initialize
	new _Viewporter();

})();


// profiles for viewporter
viewporter.profiles = {

	'iPhone|iPod': {
		ppi: function() { return window.devicePixelRatio >= 2 ? 326 : 163; },
		width: function(w,h) { return w * window.devicePixelRatio; },
		height: function(w,h) {  return h * window.devicePixelRatio; },
		chromePrescale: function(w,h,scale) {

			// TODO: include status bar style
			// find out iOS specific stuff (web app)
			//var statusBarStyle = _findMeta('apple-mobile-web-app-status-bar-style');
			//if(statusBarStyle) {
			//	IOS_STATUS_BAR_STYLE = statusBarStyle.getAttribute('content');
			//}

			if(window.devicePixelRatio >= 2) {
				return ((navigator.standalone ? 0 : (viewporter.isLandscape() ? 100 : 124)) * scale) + 2;
			} else {
				return ((navigator.standalone ? 0 : (viewporter.isLandscape() ? 50 : 62)) * scale) + 2;
			}

		}
	},

	'iPad': {
		ppi: 132,
		chrome: function(w,h) {
			// old, deprecated one:
			// return (navigator.standalone ? 0 : 78);
			return (navigator.standalone ? 0 : ( /OS 5_/.test(navigator.userAgent) ? 96 : 78) );
		}
	},

	// on Samsung Galaxy S, S2 and Nexus S we must hard set w, h
	'GT-I9000|GT-I9100|Nexus S': {
		ppi: function() { // I literally have no idea why the actual ppi is so different from the one I need to put in here.
			if(/GT-I9000/.test(navigator.userAgent)) { return 239.3; }
			if(/GT-I9100/.test(navigator.userAgent)) { return 239.3; }
			if(/Nexus S/.test(navigator.userAgent)) { return 239; }
		},
		width: 800,
		height: 480,
		chrome: 38
	},

	// Motorola Xoom fabulously rotates the screen size. Die in hell.
	'MZ601': {
		ppi: 160,
		portrait: {
			width: function(w, h) { return h; },
			height: function(w, h) { return w; }
		},
		chrome: 152,
		inverseLandscape: true
	},

	// Samsung Galaxy Pad inverts and randomizes screen size...wtf!
	'GT-P1000': {
		width: 1024,
		height: 600,
		portrait: {
			chrome: 38
		}
	},

	// HTC Desire & HTC Desire HD
	// this guy doesn't have a chrome height, if you scroll away, the thing is actually full screen..
	'Desire_A8181|DesireHD_A9191': {
		width: 800,
		height: 480
	},

	// Asus eePad Transformer TF101
	// Thanks to @cubiq
	'TF101': {
		ppi: 160,
		portrait: {
			width: function(w, h) { return h; },
			height: function(w, h) { return w; }
		},
		chrome: 103,
		inverseLandscape: true
	}

};
