Zynga Viewporter v2.1
================

Viewporter is a open-source JavaScript project by Zynga to ease mobile viewport management. It specifically simplifies the part of setting up the right screen dimensions and removes the pain from handling the *viewport* meta tag manually.

What does it do?
----------------

When put into the header of a page and when running a mobile device, Viewporter will first try to scroll away any URL or debug bars to maximize the visible window, and then substracts the remaining chrome/UI height from the window, effectively removing ugly scrollbars along the way. It will also track orientationchange, thus, you will always have a maximized viewing experience.

How to use?
-----------

In v1, all you had to to was to put Viewporter into the head of the page. There's just a little bit more to do in v2, but it isn't painful:

# Add the following meta viewport to the <head> of your page:
	<meta name="viewport" content="initial-scale=1.0,maximum-scale=1.0" />
# Wrap your <body> element with the viewporter wrapper div:
	<body>
	<div id="viewporter">
		...
	</div>
	</body>

That's it, really! Feel free to have a look at the demo pages if something doesn't work as expected.

What's wrong with doing it manually?
------------------------------------

You could of course try to set the viewport meta tag yourselves, as suggested in [various](https://developer.mozilla.org/en/mobile/viewport_meta_tag) [places](http://dev.opera.com/articles/view/an-introduction-to-meta-viewport-and-viewport/), usually something like *&lt;meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"&gt;*. You will quickly recognize two apparent issues:

* proportional device-height doesn't subtract the chrome height, so the window is always larger than the viewport when set, causing scrollbars even on empty pages
* rotating the device will cause the page to zoom (as device-width isn't inverted on rotation)
* even with a manually fixed viewport, there's a stupid gap at the bottom of the page (when using absolutely positioned elements)

Advantages of using Viewporter
--------------------

So what's in it for you? There's a couple of automatic advantages for you when the Viewporter is running. Here's a list:

* Maximized viewport (scrolling away unneeded UI)
* Easy layouting

Easy layouting?
---------------

Yep. Take a *&lt;div&gt;*, position it absolutely, set its width and height to "50%", left and bottom to 0 and the background to any color. With Viewporter enabled,  it will be placed at the bottom left corner of the window, and stretch to the middle of the window. Sounds obvious right? It isn't really, when you want a maximized window.

API
---

Viewporter is almost zero configuration. There's only one constant to check if Viewporter is in fact running, a convienience method to detect landscape orientation and a smart ready callback function. In addition, there's a couple of events you will likely want to use.

### Options

* viewporter.forceDetection (Boolean) - defaults to false, enabling it will cause the Viewporter not to use its profiles for devices (see devicepixel demo)

* viewporter.preventPageScroll (Boolean) - defaults to false, enabling it will prevent scroll events on the body element. Use this option to cancel iOS overscroll effect, which causes the view to bounce back when scrolling exceeds the bounds. Additionally it will scroll back the pane if the user clicks the page after selecting the address bar on iOS.

### Constants

* viewporter.ACTIVE - _true_ if the Viewporter is enabled and running (smartphones!), false if not (Desktop, non-touch device)
* viewporter.READY - _true_ when the viewportready function has already been fired. Useful if you're lazy loading initializing code

### Methods

* viewporter.isLandscape() - returns wether the device is rotated to landscape or not
* viewporter.ready() - accepts a callback and fires it when the viewporter has been successfully executed
* viewporter.refresh() - refreshes the viewport. This is eg. useful when the browser displays an inline confirmations such as the geolocation alert on Android. **Hint**: Listen for `resize` events and then call this method.

### Events

All events fire as native events on the window object.

* viewportready - fires as soon as the Viewporter has been executed for the first time
* viewportchange - fires when the viewport changes, i.e. the device is rotated, and after Viewporter has been executed again