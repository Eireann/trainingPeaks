http://blog.jquery.com/2014/01/24/jquery-1-11-and-2-1-released/

jQuery 1.11 and 2.1 (common to both)

Ajax

* http://bugs.jquery.com/ticket/14036: ajaxLocation Includes HTTP Basic Authentication Info
* http://bugs.jquery.com/ticket/14356: Remove string indexing used in AJAX
* http://bugs.jquery.com/ticket/14379: Issue with xhr.js
Attributes

* http://bugs.jquery.com/ticket/14250: addClass and removeClass needlessly assign to className.
Build

* http://bugs.jquery.com/ticket/12757: Enforce style guide via build process
* http://bugs.jquery.com/ticket/13983: Switch to //* http://bugs.jquery.com/ticket/ for sourcemap directives
* http://bugs.jquery.com/ticket/14016: Include a build option for customizing exports
* http://bugs.jquery.com/ticket/14113: AMD-ify jQuery source
* http://bugs.jquery.com/ticket/14118: Use bower to include Sizzle and QUnit (remove submodules)
* http://bugs.jquery.com/ticket/14163: Make Deferreds/Callbacks/.ready() optional modules
* http://bugs.jquery.com/ticket/14415: Remove sourcemap comment
* http://bugs.jquery.com/ticket/14450: Remove CommonJS+AMD syntax from source
* http://bugs.jquery.com/ticket/14451: Add bower and npm registrations to release script
* http://bugs.jquery.com/ticket/14504: Build: Upgrade to grunt-contrib-jshint 0.7.1 and squash subtasks
* http://bugs.jquery.com/ticket/14615: Manage bower dependencies with grunt-bowercopy
* http://bugs.jquery.com/ticket/14702: Problem with npm package for jquery ‘latest’
Core

* http://bugs.jquery.com/ticket/14164: Reduce forced layout reflows in init or methods
* http://bugs.jquery.com/ticket/14492: parseJSON incorrectly accepts comma expressions
* http://bugs.jquery.com/ticket/14548: npm jQuery does not have a main module
* http://bugs.jquery.com/ticket/14549: npm jQuery does not expose the jQuery function, but instead a wierd factory
* http://bugs.jquery.com/ticket/14645: Remove global exposure for CommonJS environments with a document
Css

* http://bugs.jquery.com/ticket/14150: IE9-10 curCSS => “Interface not supported” in for popups (and probably frames)
* http://bugs.jquery.com/ticket/14394: style=”x: y !important;” doesn’t get changed when calling el.css(x, z) in Chrome and Safari but it works in Firefox
Data

* http://bugs.jquery.com/ticket/14101: Version 1.10 .data() differs from 1.8 when getting data from non-existent object
* http://bugs.jquery.com/ticket/14459: data-* attribute parsing bypasses jQuery.parseJSON (inconsistent with 1.x)
Effects

* http://bugs.jquery.com/ticket/14344: Putting different effects in callbacks uses only the first effect.
Event

* http://bugs.jquery.com/ticket/13993: .triggerHandler doesn’t return value from handler for DOM0 events
* http://bugs.jquery.com/ticket/14180: focusin/out special events don’t work cross-window
* http://bugs.jquery.com/ticket/14282: Don’t call getPreventDefault() if there is a defaultPrevented property
Manipulation

* http://bugs.jquery.com/ticket/14716: Textarea isn’t cloned properly in IE11
Misc

* http://bugs.jquery.com/ticket/14040: Tests: Replace QUnit.reset usage
Selector

* http://bugs.jquery.com/ticket/14142: Wrong number of elements returned in XML document with numeric IDs in Safari
* http://bugs.jquery.com/ticket/14351: Exception thrown when running `find` in a non-attached DOM node
* http://bugs.jquery.com/ticket/14381: .add() throws “no such interface” in IE when adding nodes from another window
* http://bugs.jquery.com/ticket/14535: Selection fails in IE11 when the last context is a no-longer-present iframe document
* http://bugs.jquery.com/ticket/14584: Attribute Ends With case-insensitive in some IE8
Support

* http://bugs.jquery.com/ticket/10814: make support as lazy as possible with closure in mind
* http://bugs.jquery.com/ticket/14084: elem.css(‘width’) provides incorrect output with `box-sizing: border-box` if run before document ready
* http://bugs.jquery.com/ticket/14401: Error when loading a page with application/xhtml+xml
* http://bugs.jquery.com/ticket/14496: jQuery 2.1.0-beta1 fails to initialize in a XHTML page
jQuery 1.11

Ajax

* http://bugs.jquery.com/ticket/13240: IE8 Doesn’t support HTTP PATCH method
* http://bugs.jquery.com/ticket/14475: Local Ajax requests don’t work in IE 11 (ActiveXObject checking in jQuery fails)
Attributes

* http://bugs.jquery.com/ticket/2252: Setting select value via val() shows error in IE6
Build

* http://bugs.jquery.com/ticket/14663: jQuery 1.11.0-beta3 on npm
Core

* http://bugs.jquery.com/ticket/14074: jQuery 1 throws an error on window ready when there is an element in the DOM with the id ‘nodeName’
Effects

* http://bugs.jquery.com/ticket/14318: The animations fadeIn and fadeOut do to function as expected when used with stop()
Support

* http://bugs.jquery.com/ticket/14422: CSP violation including jquery in a blank page
jQuery 2.1

Ajax

* http://bugs.jquery.com/ticket/14207: Ajax error defaults to status 404
Build

* http://bugs.jquery.com/ticket/13119: Make jQuery releases available via npm
* http://bugs.jquery.com/ticket/13768: Error trying to load jQuery from node.js
* http://bugs.jquery.com/ticket/14340: Remove oldIE code from support tests on master
Core

* http://bugs.jquery.com/ticket/14313: Optimize jQuery.merge for size
Event

* http://bugs.jquery.com/ticket/14544: Remove elem reference from event handler