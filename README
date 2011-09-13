Zynga Viewporter
================

Viewporter is a open-source JavaScript project by Zynga to ease mobile viewport management. It specifically simplifies the part of setting up the right screen dimensions and removes the pain from handling the *viewport* meta tag manually.

What does it do?
----------------

When put into the header of a page and when running a mobile device, Viewporter will initialize itself automatically right away and writes the correct *viewport* meta tag to the page. Additionally, it rewrites the tag as soon as it registers an orientationchange event (when the device is rotated). It will first try to scroll away any URL or debug bars to maximize the visible window, and then substracts the remaining chrome/UI height from the window, effectively removing ugly scrollbars along the way. It also by default always triggers the native resolution, mapping device pixels to CSS pixels, for a maximum performance boost.

What's wrong with doing it manually?
------------------------------------

You could of course try to set the viewport meta tag yourselves, as suggested in [various](https://developer.mozilla.org/en/mobile/viewport_meta_tag) [places](http://dev.opera.com/articles/view/an-introduction-to-meta-viewport-and-viewport/), usually something like *<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">*. You will quickly recognize two apparent issues:

* device-width is lying (device-width is often *not* the actual screen width)
* proportional device-height doesn't subtract the chrome height, so the window is always larger than the viewport when set, causing scrollbars even on empty pages
* rotating the device will cause the page to zoom (as device-width isn't inverted on rotation)

Advantages of using Viewporter
--------------------

So what's in it for you? There's a couple of automatic advantages for you when the Viewporter is running. Here's a list:

* Rendering speed boost (by triggering native resolutions)
* Maximized viewport (scrolling away unneeded UI)
* Easy layouting

Easy layouting?
---------------

Yep. Take a *<div>*, position it absolutely, set its width and height to "50%", left and bottom to 0 and the background to any color. With Viewporter enabled,  it will be placed at the bottom left corner of the window, and stretch to the middle of the window. Sounds obvious right? It isn't really, when you want a maximized window.

API
---

Viewporter has a couple of useful settings, constants, events and methods.

### Settings

* z.viewporter.settings.maxDensity (default: false)
  This setting will override the native resolution for a given PPI. This allows you to design a 100px element that say, correlates to 2cm on any screen, on any device.
* z.viewporter.settings.orientationLock (default: false)
  Can be set to either "vertical" or "horizontal" and will *lock* the device to a certain orientation, blending in a warning that the user should rotate back when rotated to the wrong side.

### Constants

* z.viewporter.ACTIVE
* z.viewporter.DEVICE_SUPPORTED
* z.viewporter.DEVICE_DENSITY
* z.viewporter.META_VIEWPORT_CONTENT

### Methods

* z.viewporter.isLandscape() - returns wether the device is rotated to landscape or not
* z.viewporter.ready() - accepts a callback and fires it when the viewporter has been successfully executed

### Events

All events fire as native events on the window object.

* viewportready - fires as soon as the Viewporter has been executed for the first time
* viewportchange - fires when the viewport changes, i.e. the device is rotated, and after Viewporter has been executed again
* viewportunknown - fires when no explicit profile for this device is available (viewporter might still be able to run)