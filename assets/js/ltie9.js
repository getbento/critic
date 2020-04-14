/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
/*! NOTE: If you're already including a window.matchMedia polyfill via Modernizr or otherwise, you don't need this part */
(function(w) {
  "use strict";
  w.matchMedia = w.matchMedia || function(doc, undefined) {
    var bool, docElem = doc.documentElement, refNode = docElem.firstElementChild || docElem.firstChild, fakeBody = doc.createElement("body"), div = doc.createElement("div");
    div.id = "mq-test-1";
    div.style.cssText = "position:absolute;top:-100em";
    fakeBody.style.background = "none";
    fakeBody.appendChild(div);
    return function(q) {
      div.innerHTML = '&shy;<style media="' + q + '"> #mq-test-1 { width: 42px; }</style>';
      docElem.insertBefore(fakeBody, refNode);
      bool = div.offsetWidth === 42;
      docElem.removeChild(fakeBody);
      return {
        matches: bool,
        media: q
      };
    };
  }(w.document);
})(this);

/*! Respond.js v1.4.0: min/max-width media query polyfill. (c) Scott Jehl. MIT Lic. j.mp/respondjs  */
(function(w) {
  "use strict";
  var respond = {};
  w.respond = respond;
  respond.update = function() {};
  var requestQueue = [], xmlHttp = function() {
    var xmlhttpmethod = false;
    try {
      xmlhttpmethod = new w.XMLHttpRequest();
    } catch (e) {
      xmlhttpmethod = new w.ActiveXObject("Microsoft.XMLHTTP");
    }
    return function() {
      return xmlhttpmethod;
    };
  }(), ajax = function(url, callback) {
    var req = xmlHttp();
    if (!req) {
      return;
    }
    req.open("GET", url, true);
    req.onreadystatechange = function() {
      if (req.readyState !== 4 || req.status !== 200 && req.status !== 304) {
        return;
      }
      callback(req.responseText);
    };
    if (req.readyState === 4) {
      return;
    }
    req.send(null);
  };
  respond.ajax = ajax;
  respond.queue = requestQueue;
  respond.regex = {
    media: /@media[^\{]+\{([^\{\}]*\{[^\}\{]*\})+/gi,
    keyframes: /@(?:\-(?:o|moz|webkit)\-)?keyframes[^\{]+\{(?:[^\{\}]*\{[^\}\{]*\})+[^\}]*\}/gi,
    urls: /(url\()['"]?([^\/\)'"][^:\)'"]+)['"]?(\))/g,
    findStyles: /@media *([^\{]+)\{([\S\s]+?)$/,
    only: /(only\s+)?([a-zA-Z]+)\s?/,
    minw: /\([\s]*min\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/,
    maxw: /\([\s]*max\-width\s*:[\s]*([\s]*[0-9\.]+)(px|em)[\s]*\)/
  };
  respond.mediaQueriesSupported = w.matchMedia && w.matchMedia("only all") !== null && w.matchMedia("only all").matches;
  if (respond.mediaQueriesSupported) {
    return;
  }
  var doc = w.document, docElem = doc.documentElement, mediastyles = [], rules = [], appendedEls = [], parsedSheets = {}, resizeThrottle = 30, head = doc.getElementsByTagName("head")[0] || docElem, base = doc.getElementsByTagName("base")[0], links = head.getElementsByTagName("link"), lastCall, resizeDefer, eminpx, getEmValue = function() {
    var ret, div = doc.createElement("div"), body = doc.body, originalHTMLFontSize = docElem.style.fontSize, originalBodyFontSize = body && body.style.fontSize, fakeUsed = false;
    div.style.cssText = "position:absolute;font-size:1em;width:1em";
    if (!body) {
      body = fakeUsed = doc.createElement("body");
      body.style.background = "none";
    }
    docElem.style.fontSize = "100%";
    body.style.fontSize = "100%";
    body.appendChild(div);
    if (fakeUsed) {
      docElem.insertBefore(body, docElem.firstChild);
    }
    ret = div.offsetWidth;
    if (fakeUsed) {
      docElem.removeChild(body);
    } else {
      body.removeChild(div);
    }
    docElem.style.fontSize = originalHTMLFontSize;
    if (originalBodyFontSize) {
      body.style.fontSize = originalBodyFontSize;
    }
    ret = eminpx = parseFloat(ret);
    return ret;
  }, applyMedia = function(fromResize) {
    var name = "clientWidth", docElemProp = docElem[name], currWidth = doc.compatMode === "CSS1Compat" && docElemProp || doc.body[name] || docElemProp, styleBlocks = {}, lastLink = links[links.length - 1], now = new Date().getTime();
    if (fromResize && lastCall && now - lastCall < resizeThrottle) {
      w.clearTimeout(resizeDefer);
      resizeDefer = w.setTimeout(applyMedia, resizeThrottle);
      return;
    } else {
      lastCall = now;
    }
    for (var i in mediastyles) {
      if (mediastyles.hasOwnProperty(i)) {
        var thisstyle = mediastyles[i], min = thisstyle.minw, max = thisstyle.maxw, minnull = min === null, maxnull = max === null, em = "em";
        if (!!min) {
          min = parseFloat(min) * (min.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
        }
        if (!!max) {
          max = parseFloat(max) * (max.indexOf(em) > -1 ? eminpx || getEmValue() : 1);
        }
        if (!thisstyle.hasquery || (!minnull || !maxnull) && (minnull || currWidth >= min) && (maxnull || currWidth <= max)) {
          if (!styleBlocks[thisstyle.media]) {
            styleBlocks[thisstyle.media] = [];
          }
          styleBlocks[thisstyle.media].push(rules[thisstyle.rules]);
        }
      }
    }
    for (var j in appendedEls) {
      if (appendedEls.hasOwnProperty(j)) {
        if (appendedEls[j] && appendedEls[j].parentNode === head) {
          head.removeChild(appendedEls[j]);
        }
      }
    }
    appendedEls.length = 0;
    for (var k in styleBlocks) {
      if (styleBlocks.hasOwnProperty(k)) {
        var ss = doc.createElement("style"), css = styleBlocks[k].join("\n");
        ss.type = "text/css";
        ss.media = k;
        head.insertBefore(ss, lastLink.nextSibling);
        if (ss.styleSheet) {
          ss.styleSheet.cssText = css;
        } else {
          ss.appendChild(doc.createTextNode(css));
        }
        appendedEls.push(ss);
      }
    }
  }, translate = function(styles, href, media) {
    var qs = styles.replace(respond.regex.keyframes, "").match(respond.regex.media), ql = qs && qs.length || 0;
    href = href.substring(0, href.lastIndexOf("/"));
    var repUrls = function(css) {
      return css.replace(respond.regex.urls, "$1" + href + "$2$3");
    }, useMedia = !ql && media;
    if (href.length) {
      href += "/";
    }
    if (useMedia) {
      ql = 1;
    }
    for (var i = 0; i < ql; i++) {
      var fullq, thisq, eachq, eql;
      if (useMedia) {
        fullq = media;
        rules.push(repUrls(styles));
      } else {
        fullq = qs[i].match(respond.regex.findStyles) && RegExp.$1;
        rules.push(RegExp.$2 && repUrls(RegExp.$2));
      }
      eachq = fullq.split(",");
      eql = eachq.length;
      for (var j = 0; j < eql; j++) {
        thisq = eachq[j];
        mediastyles.push({
          media: thisq.split("(")[0].match(respond.regex.only) && RegExp.$2 || "all",
          rules: rules.length - 1,
          hasquery: thisq.indexOf("(") > -1,
          minw: thisq.match(respond.regex.minw) && parseFloat(RegExp.$1) + (RegExp.$2 || ""),
          maxw: thisq.match(respond.regex.maxw) && parseFloat(RegExp.$1) + (RegExp.$2 || "")
        });
      }
    }
    applyMedia();
  }, makeRequests = function() {
    if (requestQueue.length) {
      var thisRequest = requestQueue.shift();
      ajax(thisRequest.href, function(styles) {
        translate(styles, thisRequest.href, thisRequest.media);
        parsedSheets[thisRequest.href] = true;
        w.setTimeout(function() {
          makeRequests();
        }, 0);
      });
    }
  }, ripCSS = function() {
    for (var i = 0; i < links.length; i++) {
      var sheet = links[i], href = sheet.href, media = sheet.media, isCSS = sheet.rel && sheet.rel.toLowerCase() === "stylesheet";
      if (!!href && isCSS && !parsedSheets[href]) {
        if (sheet.styleSheet && sheet.styleSheet.rawCssText) {
          translate(sheet.styleSheet.rawCssText, href, media);
          parsedSheets[href] = true;
        } else {
          if (!/^([a-zA-Z:]*\/\/)/.test(href) && !base || href.replace(RegExp.$1, "").split("/")[0] === w.location.host) {
            if (href.substring(0, 2) === "//") {
              href = w.location.protocol + href;
            }
            requestQueue.push({
              href: href,
              media: media
            });
          }
        }
      }
    }
    makeRequests();
  };
  ripCSS();
  respond.update = ripCSS;
  respond.getEmValue = getEmValue;
  function callMedia() {
    applyMedia(true);
  }
  if (w.addEventListener) {
    w.addEventListener("resize", callMedia, false);
  } else if (w.attachEvent) {
    w.attachEvent("onresize", callMedia);
  }
})(this);
(function (window, undefined) {
    "use strict";
    // test for REM unit support
    var cssremunit =  function() {
        var div = document.createElement( 'div' );
            div.style.cssText = 'font-size: 1rem;';

        return (/rem/).test(div.style.fontSize);
    },

    // filter returned links for stylesheets
    isStyleSheet = function () {
        var styles = document.getElementsByTagName('link'),
            filteredLinks = [];

        for ( var i = 0; i < styles.length; i++) {
            if ( styles[i].rel.toLowerCase() === 'stylesheet' && styles[i].getAttribute('data-norem') === null ) {

                filteredLinks.push( styles[i].href );
            }
        }

        return filteredLinks;
    },

   processLinks = function () {
        //prepare to match each link
        for( var i = 0; i < links.length; i++ ){
            xhr( links[i], storeCSS );
        }
    },

    storeCSS = function ( response, link ) {

        preCSS.push(response.responseText);
        CSSLinks.push(link);

        if( CSSLinks.length === links.length ){
            for( var j = 0; j <  CSSLinks.length; j++ ){
                matchCSS( preCSS[j], CSSLinks[j] );
            }

            if( ( links = importLinks.slice(0) ).length > 0 ){ //after finishing all current links, set links equal to the new imports found
                CSSLinks = [];
                preCSS = [];
                importLinks = [];
                processLinks();
            } else {
                buildCSS();
            }
        }
    },

    matchCSS = function ( sheetCSS, link ) { // collect all of the rules from the xhr response texts and match them to a pattern
        var clean = removeMediaQueries( sheetCSS ).replace(/\/\*[\s\S]*?\*\//g, ''), // remove MediaQueries and comments
            pattern = /[\w\d\s\-\/\\\[\]:,.'"*()<>+~%#^$_=|@]+\{[\w\d\s\-\/\\%#:!;,.'"*()]+\d*\.?\d+rem[\w\d\s\-\/\\%#:!;,.'"*()]*\}/g, //find selectors that use rem in one or more of their rules
            current = clean.match(pattern),
            remPattern =/\d*\.?\d+rem/g,
            remCurrent = clean.match(remPattern),
            sheetPathPattern = /(.*\/)/,
            sheetPath = sheetPathPattern.exec(link)[0], //relative path to css file specified in @import
            importPattern = /@import (?:url\()?['"]?([^'\)"]*)['"]?\)?[^;]*/gm, //matches all @import variations outlined at: https://developer.mozilla.org/en-US/docs/Web/CSS/@import
            importStatement;

        while( (importStatement = importPattern.exec(sheetCSS)) !== null ){
            if( importStatement[1].indexOf("/") === 0 ) { // check if the value of importStatement[1] is a root relative path, in which case it shouldn't be concatenated with sheetPath
                importLinks.push( importStatement[1] );
            } else {
                importLinks.push( sheetPath + importStatement[1] );
            }
        }

        if( current !== null && current.length !== 0 ){
            found = found.concat( current ); // save all of the blocks of rules with rem in a property
            foundProps = foundProps.concat( remCurrent ); // save all of the properties with rem
        }
    },

    buildCSS = function () { // first build each individual rule from elements in the found array and then add it to the string of rules.
        var pattern = /[\w\d\s\-\/\\%#:,.'"*()]+\d*\.?\d+rem[\w\d\s\-\/\\%#:!,.'"*()]*[;}]/g; // find properties with rem values in them
        for( var i = 0; i < found.length; i++ ){
            rules = rules + found[i].substr(0,found[i].indexOf("{")+1); // save the selector portion of each rule with a rem value
            var current = found[i].match( pattern );
            for( var j = 0; j<current.length; j++ ){ // build a new set of with only the selector and properties that have rem in the value
                rules = rules + current[j];
                if( j === current.length-1 && rules[rules.length-1] !== "}" ){
                    rules = rules + "\n}";
                }
            }
        }

        parseCSS();
    },

    parseCSS = function () { // replace each set of parentheses with evaluated content
        for( var i = 0; i < foundProps.length; i++ ){
            css[i] = Math.round( parseFloat(foundProps[i].substr(0,foundProps[i].length-3)*fontSize) ) + 'px';
        }

        loadCSS();
    },

    loadCSS = function () { // replace and load the new rules
        for( var i = 0; i < css.length; i++ ){ // only run this loop as many times as css has entries
            if( css[i] ){
                rules = rules.replace( foundProps[i],css[i] ); // replace old rules with our processed rules
            }
        }
        var remcss = document.createElement( 'style' );
        remcss.setAttribute( 'type', 'text/css' );
        remcss.id = 'remReplace';
        document.getElementsByTagName( 'head' )[0].appendChild( remcss );   // create the new element
        if( remcss.styleSheet ) {
            remcss.styleSheet.cssText = rules; // IE8 will not support innerHTML on read-only elements, such as STYLE
        } else {
            remcss.appendChild( document.createTextNode( rules ) );
        }
    },

    xhr = function ( url, callback ) { // create new XMLHttpRequest object and run it
        try {
            //try to create a request object
            //arranging the two conditions this way is for IE7/8's benefit
            //so that it works with any combination of ActiveX or Native XHR settings, 
            //as long as one or the other is enabled; but if both are enabled
            //it prefers ActiveX, which means it still works with local files
            //(Native XHR in IE7/8 is blocked and throws "access is denied",
            // but ActiveX is permitted if the user allows it [default is to prompt])
            var xhr = window.ActiveXObject ? ( new ActiveXObject('Microsoft.XMLHTTP') || new ActiveXObject('Msxml2.XMLHTTP') ) : new XMLHttpRequest();

            xhr.open( 'GET', url, true );
            xhr.onreadystatechange = function() {
                if ( xhr.readyState === 4 ){
                    callback(xhr, url);
                } // else { callback function on AJAX error }
            };

            xhr.send( null );
        } catch (e){
            if ( window.XDomainRequest ) {
                var xdr = new XDomainRequest();
                xdr.open('get', url);
                xdr.onload = function() {
                    callback(xdr, url);
                };
                xdr.onerror = function() {
                    return false; // xdr load fail
                };
                xdr.send();
            }
        }
    },

    // Remove queries.
    removeMediaQueries = function(css) {
        // Test for Media Query support
        if ( !window.matchMedia && !window.msMatchMedia ) {
            // If the browser doesn't support media queries, we find all @media declarations in the CSS and remove them.
            // Note: Since @rules can't be nested in the CSS spec, we're safe to just check for the closest following "}}" to the "@media".
            css = css.replace(/@media[\s\S]*?\}\s*\}/g, "");
        }

        return css;
    };

    if( !cssremunit() ){ // this checks if the rem value is supported
        var rules = '', // initialize the rules variable in this scope so it can be used later
            links = isStyleSheet(), // initialize the array holding the sheets urls for use later
            importLinks = [], //initialize the array holding the import sheet urls for use later
            found = [], // initialize the array holding the found rules for use later
            foundProps = [], // initialize the array holding the found properties for use later
            preCSS = [], // initialize array that holds css before being parsed
            CSSLinks = [], //initialize array holding css links returned from xhr
            css = [], // initialize the array holding the parsed rules for use later
            fontSize = '';

        // Notice: rem is a "root em" that means that in case when html element size was changed by css
        // or style we should not change document.documentElement.fontSize to 1em - only body size should be changed
        // to 1em for calculation

        fontSize = (function () {
            var doc = document,
                docElement = doc.documentElement,
                body = doc.body || doc.createElement('body'),
                isFakeBody = !doc.body,
                div = doc.createElement('div'),
                currentSize = body.style.fontSize,
                size;

            if ( isFakeBody ) {
                docElement.appendChild( body );
            }

            div.style.cssText = 'width:1em; position:absolute; visibility:hidden; padding: 0;';

            body.style.fontSize = '1em';

            body.appendChild( div );
            size = div.offsetWidth;

            if ( isFakeBody ) {
                docElement.removeChild( body );
            }
            else {
                body.removeChild( div );
                body.style.fontSize = currentSize;
            }

            return size;
        }());

        processLinks();
    } // else { do nothing, you are awesome and have REM support }

})(window);

/*
 * raf.js
 * https://github.com/ngryman/raf.js
 *
 * original requestAnimationFrame polyfill by Erik Möller
 * inspired from paul_irish gist and post
 *
 * Copyright (c) 2013 ngryman
 * Licensed under the MIT license.
 */

(function(window) {
	var lastTime = 0,
		vendors = ['webkit', 'moz'],
		requestAnimationFrame = window.requestAnimationFrame,
		cancelAnimationFrame = window.cancelAnimationFrame,
		i = vendors.length;

	// try to un-prefix existing raf
	while (--i >= 0 && !requestAnimationFrame) {
		requestAnimationFrame = window[vendors[i] + 'RequestAnimationFrame'];
		cancelAnimationFrame = window[vendors[i] + 'CancelAnimationFrame'];
	}

	// polyfill with setTimeout fallback
	// heavily inspired from @darius gist mod: https://gist.github.com/paulirish/1579671#comment-837945
	if (!requestAnimationFrame || !cancelAnimationFrame) {
		requestAnimationFrame = function(callback) {
			var now = +new Date(), nextTime = Math.max(lastTime + 16, now);
			return setTimeout(function() {
				callback(lastTime = nextTime);
			}, nextTime - now);
		};

		cancelAnimationFrame = clearTimeout;
	}

	// export to window
	window.requestAnimationFrame = requestAnimationFrame;
	window.cancelAnimationFrame = cancelAnimationFrame;
}(window));

/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2014-12-13
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

// Full polyfill for browsers with no classList support
if (!("classList" in document.createElement("_"))) {

(function (view) {

"use strict";

if (!('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = view.Element[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.getAttribute("class") || "")
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.setAttribute("class", this.toString());
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
		, index
	;
	do {
		token = tokens[i] + "";
		index = checkTokenAndGetIndex(this, token);
		while (index !== -1) {
			this.splice(index, 1);
			updated = true;
			index = checkTokenAndGetIndex(this, token);
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, force) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			force !== true && "remove"
		:
			force !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	if (force === true || force === false) {
		return force;
	} else {
		return !result;
	}
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

} else {
// There is full or partial native classList support, so just check if we need
// to normalize the add/remove and toggle APIs.

(function () {
	"use strict";

	var testElement = document.createElement("_");

	testElement.classList.add("c1", "c2");

	// Polyfill for IE 10/11 and Firefox <26, where classList.add and
	// classList.remove exist but support only one argument at a time.
	if (!testElement.classList.contains("c2")) {
		var createMethod = function(method) {
			var original = DOMTokenList.prototype[method];

			DOMTokenList.prototype[method] = function(token) {
				var i, len = arguments.length;

				for (i = 0; i < len; i++) {
					token = arguments[i];
					original.call(this, token);
				}
			};
		};
		createMethod('add');
		createMethod('remove');
	}

	testElement.classList.toggle("c3", false);

	// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
	// support the second argument.
	if (testElement.classList.contains("c3")) {
		var _toggle = DOMTokenList.prototype.toggle;

		DOMTokenList.prototype.toggle = function(token, force) {
			if (1 in arguments && !this.contains(token) === !force) {
				return force;
			} else {
				return _toggle.call(this, token);
			}
		};

	}

	testElement = null;
}());

}

}


if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/) {
    	var len = this.length >>> 0;
    	var from = Number(arguments[1]) || 0;
    	from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    	if (from < 0) from += len;
    	for (; from < len; from++){
      		if (from in this && this[from] === elt) return from;
    	}
    return -1;
  };
}
// Function.bind Polyfill
// Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
// Note: I couldn't find a good Bower package, so I had to use this instead.
// 
// The reason for classList, requestAnimationFrame, and Function.bind polyfills is to support
// headroom.js.

if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {},
        fBound  = function() {
            return fToBind.apply(this instanceof fNOP
                ? this
                : oThis,
                aArgs.concat(Array.prototype.slice.call(arguments)));
        };

        if (this.prototype) {
            // Function.prototype doesn't have a prototype property
            fNOP.prototype = this.prototype; 
        }
        fBound.prototype = new fNOP();

        return fBound;
    };
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlc3BvbmQuc3JjLmpzIiwicmVtLmpzIiwicmFmLmpzIiwiY2xhc3NMaXN0LmpzIiwiYXJyYXkuaW5kZXhvZi5wb2x5ZmlsbC5qcyIsImZ1bmN0aW9uLmJpbmQucG9seWZpbGwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibHRpZTkuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiEgbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLiBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcy4gRHVhbCBNSVQvQlNEIGxpY2Vuc2UgKi9cbi8qISBOT1RFOiBJZiB5b3UncmUgYWxyZWFkeSBpbmNsdWRpbmcgYSB3aW5kb3cubWF0Y2hNZWRpYSBwb2x5ZmlsbCB2aWEgTW9kZXJuaXpyIG9yIG90aGVyd2lzZSwgeW91IGRvbid0IG5lZWQgdGhpcyBwYXJ0ICovXG4oZnVuY3Rpb24odykge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdy5tYXRjaE1lZGlhID0gdy5tYXRjaE1lZGlhIHx8IGZ1bmN0aW9uKGRvYywgdW5kZWZpbmVkKSB7XG4gICAgdmFyIGJvb2wsIGRvY0VsZW0gPSBkb2MuZG9jdW1lbnRFbGVtZW50LCByZWZOb2RlID0gZG9jRWxlbS5maXJzdEVsZW1lbnRDaGlsZCB8fCBkb2NFbGVtLmZpcnN0Q2hpbGQsIGZha2VCb2R5ID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIpLCBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuaWQgPSBcIm1xLXRlc3QtMVwiO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTt0b3A6LTEwMGVtXCI7XG4gICAgZmFrZUJvZHkuc3R5bGUuYmFja2dyb3VuZCA9IFwibm9uZVwiO1xuICAgIGZha2VCb2R5LmFwcGVuZENoaWxkKGRpdik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHEpIHtcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAnJnNoeTs8c3R5bGUgbWVkaWE9XCInICsgcSArICdcIj4gI21xLXRlc3QtMSB7IHdpZHRoOiA0MnB4OyB9PC9zdHlsZT4nO1xuICAgICAgZG9jRWxlbS5pbnNlcnRCZWZvcmUoZmFrZUJvZHksIHJlZk5vZGUpO1xuICAgICAgYm9vbCA9IGRpdi5vZmZzZXRXaWR0aCA9PT0gNDI7XG4gICAgICBkb2NFbGVtLnJlbW92ZUNoaWxkKGZha2VCb2R5KTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1hdGNoZXM6IGJvb2wsXG4gICAgICAgIG1lZGlhOiBxXG4gICAgICB9O1xuICAgIH07XG4gIH0ody5kb2N1bWVudCk7XG59KSh0aGlzKTtcblxuLyohIFJlc3BvbmQuanMgdjEuNC4wOiBtaW4vbWF4LXdpZHRoIG1lZGlhIHF1ZXJ5IHBvbHlmaWxsLiAoYykgU2NvdHQgSmVobC4gTUlUIExpYy4gai5tcC9yZXNwb25kanMgICovXG4oZnVuY3Rpb24odykge1xuICBcInVzZSBzdHJpY3RcIjtcbiAgdmFyIHJlc3BvbmQgPSB7fTtcbiAgdy5yZXNwb25kID0gcmVzcG9uZDtcbiAgcmVzcG9uZC51cGRhdGUgPSBmdW5jdGlvbigpIHt9O1xuICB2YXIgcmVxdWVzdFF1ZXVlID0gW10sIHhtbEh0dHAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeG1saHR0cG1ldGhvZCA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICB4bWxodHRwbWV0aG9kID0gbmV3IHcuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB4bWxodHRwbWV0aG9kID0gbmV3IHcuQWN0aXZlWE9iamVjdChcIk1pY3Jvc29mdC5YTUxIVFRQXCIpO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4geG1saHR0cG1ldGhvZDtcbiAgICB9O1xuICB9KCksIGFqYXggPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IHhtbEh0dHAoKTtcbiAgICBpZiAoIXJlcSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXEub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuICAgIHJlcS5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyZXEucmVhZHlTdGF0ZSAhPT0gNCB8fCByZXEuc3RhdHVzICE9PSAyMDAgJiYgcmVxLnN0YXR1cyAhPT0gMzA0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhbGxiYWNrKHJlcS5yZXNwb25zZVRleHQpO1xuICAgIH07XG4gICAgaWYgKHJlcS5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHJlcS5zZW5kKG51bGwpO1xuICB9O1xuICByZXNwb25kLmFqYXggPSBhamF4O1xuICByZXNwb25kLnF1ZXVlID0gcmVxdWVzdFF1ZXVlO1xuICByZXNwb25kLnJlZ2V4ID0ge1xuICAgIG1lZGlhOiAvQG1lZGlhW15cXHtdK1xceyhbXlxce1xcfV0qXFx7W15cXH1cXHtdKlxcfSkrL2dpLFxuICAgIGtleWZyYW1lczogL0AoPzpcXC0oPzpvfG1venx3ZWJraXQpXFwtKT9rZXlmcmFtZXNbXlxce10rXFx7KD86W15cXHtcXH1dKlxce1teXFx9XFx7XSpcXH0pK1teXFx9XSpcXH0vZ2ksXG4gICAgdXJsczogLyh1cmxcXCgpWydcIl0/KFteXFwvXFwpJ1wiXVteOlxcKSdcIl0rKVsnXCJdPyhcXCkpL2csXG4gICAgZmluZFN0eWxlczogL0BtZWRpYSAqKFteXFx7XSspXFx7KFtcXFNcXHNdKz8pJC8sXG4gICAgb25seTogLyhvbmx5XFxzKyk/KFthLXpBLVpdKylcXHM/LyxcbiAgICBtaW53OiAvXFwoW1xcc10qbWluXFwtd2lkdGhcXHMqOltcXHNdKihbXFxzXSpbMC05XFwuXSspKHB4fGVtKVtcXHNdKlxcKS8sXG4gICAgbWF4dzogL1xcKFtcXHNdKm1heFxcLXdpZHRoXFxzKjpbXFxzXSooW1xcc10qWzAtOVxcLl0rKShweHxlbSlbXFxzXSpcXCkvXG4gIH07XG4gIHJlc3BvbmQubWVkaWFRdWVyaWVzU3VwcG9ydGVkID0gdy5tYXRjaE1lZGlhICYmIHcubWF0Y2hNZWRpYShcIm9ubHkgYWxsXCIpICE9PSBudWxsICYmIHcubWF0Y2hNZWRpYShcIm9ubHkgYWxsXCIpLm1hdGNoZXM7XG4gIGlmIChyZXNwb25kLm1lZGlhUXVlcmllc1N1cHBvcnRlZCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZG9jID0gdy5kb2N1bWVudCwgZG9jRWxlbSA9IGRvYy5kb2N1bWVudEVsZW1lbnQsIG1lZGlhc3R5bGVzID0gW10sIHJ1bGVzID0gW10sIGFwcGVuZGVkRWxzID0gW10sIHBhcnNlZFNoZWV0cyA9IHt9LCByZXNpemVUaHJvdHRsZSA9IDMwLCBoZWFkID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXSB8fCBkb2NFbGVtLCBiYXNlID0gZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYmFzZVwiKVswXSwgbGlua3MgPSBoZWFkLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwibGlua1wiKSwgbGFzdENhbGwsIHJlc2l6ZURlZmVyLCBlbWlucHgsIGdldEVtVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmV0LCBkaXYgPSBkb2MuY3JlYXRlRWxlbWVudChcImRpdlwiKSwgYm9keSA9IGRvYy5ib2R5LCBvcmlnaW5hbEhUTUxGb250U2l6ZSA9IGRvY0VsZW0uc3R5bGUuZm9udFNpemUsIG9yaWdpbmFsQm9keUZvbnRTaXplID0gYm9keSAmJiBib2R5LnN0eWxlLmZvbnRTaXplLCBmYWtlVXNlZCA9IGZhbHNlO1xuICAgIGRpdi5zdHlsZS5jc3NUZXh0ID0gXCJwb3NpdGlvbjphYnNvbHV0ZTtmb250LXNpemU6MWVtO3dpZHRoOjFlbVwiO1xuICAgIGlmICghYm9keSkge1xuICAgICAgYm9keSA9IGZha2VVc2VkID0gZG9jLmNyZWF0ZUVsZW1lbnQoXCJib2R5XCIpO1xuICAgICAgYm9keS5zdHlsZS5iYWNrZ3JvdW5kID0gXCJub25lXCI7XG4gICAgfVxuICAgIGRvY0VsZW0uc3R5bGUuZm9udFNpemUgPSBcIjEwMCVcIjtcbiAgICBib2R5LnN0eWxlLmZvbnRTaXplID0gXCIxMDAlXCI7XG4gICAgYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuICAgIGlmIChmYWtlVXNlZCkge1xuICAgICAgZG9jRWxlbS5pbnNlcnRCZWZvcmUoYm9keSwgZG9jRWxlbS5maXJzdENoaWxkKTtcbiAgICB9XG4gICAgcmV0ID0gZGl2Lm9mZnNldFdpZHRoO1xuICAgIGlmIChmYWtlVXNlZCkge1xuICAgICAgZG9jRWxlbS5yZW1vdmVDaGlsZChib2R5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYm9keS5yZW1vdmVDaGlsZChkaXYpO1xuICAgIH1cbiAgICBkb2NFbGVtLnN0eWxlLmZvbnRTaXplID0gb3JpZ2luYWxIVE1MRm9udFNpemU7XG4gICAgaWYgKG9yaWdpbmFsQm9keUZvbnRTaXplKSB7XG4gICAgICBib2R5LnN0eWxlLmZvbnRTaXplID0gb3JpZ2luYWxCb2R5Rm9udFNpemU7XG4gICAgfVxuICAgIHJldCA9IGVtaW5weCA9IHBhcnNlRmxvYXQocmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9LCBhcHBseU1lZGlhID0gZnVuY3Rpb24oZnJvbVJlc2l6ZSkge1xuICAgIHZhciBuYW1lID0gXCJjbGllbnRXaWR0aFwiLCBkb2NFbGVtUHJvcCA9IGRvY0VsZW1bbmFtZV0sIGN1cnJXaWR0aCA9IGRvYy5jb21wYXRNb2RlID09PSBcIkNTUzFDb21wYXRcIiAmJiBkb2NFbGVtUHJvcCB8fCBkb2MuYm9keVtuYW1lXSB8fCBkb2NFbGVtUHJvcCwgc3R5bGVCbG9ja3MgPSB7fSwgbGFzdExpbmsgPSBsaW5rc1tsaW5rcy5sZW5ndGggLSAxXSwgbm93ID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgaWYgKGZyb21SZXNpemUgJiYgbGFzdENhbGwgJiYgbm93IC0gbGFzdENhbGwgPCByZXNpemVUaHJvdHRsZSkge1xuICAgICAgdy5jbGVhclRpbWVvdXQocmVzaXplRGVmZXIpO1xuICAgICAgcmVzaXplRGVmZXIgPSB3LnNldFRpbWVvdXQoYXBwbHlNZWRpYSwgcmVzaXplVGhyb3R0bGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0Q2FsbCA9IG5vdztcbiAgICB9XG4gICAgZm9yICh2YXIgaSBpbiBtZWRpYXN0eWxlcykge1xuICAgICAgaWYgKG1lZGlhc3R5bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciB0aGlzc3R5bGUgPSBtZWRpYXN0eWxlc1tpXSwgbWluID0gdGhpc3N0eWxlLm1pbncsIG1heCA9IHRoaXNzdHlsZS5tYXh3LCBtaW5udWxsID0gbWluID09PSBudWxsLCBtYXhudWxsID0gbWF4ID09PSBudWxsLCBlbSA9IFwiZW1cIjtcbiAgICAgICAgaWYgKCEhbWluKSB7XG4gICAgICAgICAgbWluID0gcGFyc2VGbG9hdChtaW4pICogKG1pbi5pbmRleE9mKGVtKSA+IC0xID8gZW1pbnB4IHx8IGdldEVtVmFsdWUoKSA6IDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghIW1heCkge1xuICAgICAgICAgIG1heCA9IHBhcnNlRmxvYXQobWF4KSAqIChtYXguaW5kZXhPZihlbSkgPiAtMSA/IGVtaW5weCB8fCBnZXRFbVZhbHVlKCkgOiAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXNzdHlsZS5oYXNxdWVyeSB8fCAoIW1pbm51bGwgfHwgIW1heG51bGwpICYmIChtaW5udWxsIHx8IGN1cnJXaWR0aCA+PSBtaW4pICYmIChtYXhudWxsIHx8IGN1cnJXaWR0aCA8PSBtYXgpKSB7XG4gICAgICAgICAgaWYgKCFzdHlsZUJsb2Nrc1t0aGlzc3R5bGUubWVkaWFdKSB7XG4gICAgICAgICAgICBzdHlsZUJsb2Nrc1t0aGlzc3R5bGUubWVkaWFdID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIHN0eWxlQmxvY2tzW3RoaXNzdHlsZS5tZWRpYV0ucHVzaChydWxlc1t0aGlzc3R5bGUucnVsZXNdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBqIGluIGFwcGVuZGVkRWxzKSB7XG4gICAgICBpZiAoYXBwZW5kZWRFbHMuaGFzT3duUHJvcGVydHkoaikpIHtcbiAgICAgICAgaWYgKGFwcGVuZGVkRWxzW2pdICYmIGFwcGVuZGVkRWxzW2pdLnBhcmVudE5vZGUgPT09IGhlYWQpIHtcbiAgICAgICAgICBoZWFkLnJlbW92ZUNoaWxkKGFwcGVuZGVkRWxzW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBhcHBlbmRlZEVscy5sZW5ndGggPSAwO1xuICAgIGZvciAodmFyIGsgaW4gc3R5bGVCbG9ja3MpIHtcbiAgICAgIGlmIChzdHlsZUJsb2Nrcy5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICB2YXIgc3MgPSBkb2MuY3JlYXRlRWxlbWVudChcInN0eWxlXCIpLCBjc3MgPSBzdHlsZUJsb2Nrc1trXS5qb2luKFwiXFxuXCIpO1xuICAgICAgICBzcy50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgICAgICBzcy5tZWRpYSA9IGs7XG4gICAgICAgIGhlYWQuaW5zZXJ0QmVmb3JlKHNzLCBsYXN0TGluay5uZXh0U2libGluZyk7XG4gICAgICAgIGlmIChzcy5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3Muc3R5bGVTaGVldC5jc3NUZXh0ID0gY3NzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNzLmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShjc3MpKTtcbiAgICAgICAgfVxuICAgICAgICBhcHBlbmRlZEVscy5wdXNoKHNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHRyYW5zbGF0ZSA9IGZ1bmN0aW9uKHN0eWxlcywgaHJlZiwgbWVkaWEpIHtcbiAgICB2YXIgcXMgPSBzdHlsZXMucmVwbGFjZShyZXNwb25kLnJlZ2V4LmtleWZyYW1lcywgXCJcIikubWF0Y2gocmVzcG9uZC5yZWdleC5tZWRpYSksIHFsID0gcXMgJiYgcXMubGVuZ3RoIHx8IDA7XG4gICAgaHJlZiA9IGhyZWYuc3Vic3RyaW5nKDAsIGhyZWYubGFzdEluZGV4T2YoXCIvXCIpKTtcbiAgICB2YXIgcmVwVXJscyA9IGZ1bmN0aW9uKGNzcykge1xuICAgICAgcmV0dXJuIGNzcy5yZXBsYWNlKHJlc3BvbmQucmVnZXgudXJscywgXCIkMVwiICsgaHJlZiArIFwiJDIkM1wiKTtcbiAgICB9LCB1c2VNZWRpYSA9ICFxbCAmJiBtZWRpYTtcbiAgICBpZiAoaHJlZi5sZW5ndGgpIHtcbiAgICAgIGhyZWYgKz0gXCIvXCI7XG4gICAgfVxuICAgIGlmICh1c2VNZWRpYSkge1xuICAgICAgcWwgPSAxO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHFsOyBpKyspIHtcbiAgICAgIHZhciBmdWxscSwgdGhpc3EsIGVhY2hxLCBlcWw7XG4gICAgICBpZiAodXNlTWVkaWEpIHtcbiAgICAgICAgZnVsbHEgPSBtZWRpYTtcbiAgICAgICAgcnVsZXMucHVzaChyZXBVcmxzKHN0eWxlcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZnVsbHEgPSBxc1tpXS5tYXRjaChyZXNwb25kLnJlZ2V4LmZpbmRTdHlsZXMpICYmIFJlZ0V4cC4kMTtcbiAgICAgICAgcnVsZXMucHVzaChSZWdFeHAuJDIgJiYgcmVwVXJscyhSZWdFeHAuJDIpKTtcbiAgICAgIH1cbiAgICAgIGVhY2hxID0gZnVsbHEuc3BsaXQoXCIsXCIpO1xuICAgICAgZXFsID0gZWFjaHEubGVuZ3RoO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBlcWw7IGorKykge1xuICAgICAgICB0aGlzcSA9IGVhY2hxW2pdO1xuICAgICAgICBtZWRpYXN0eWxlcy5wdXNoKHtcbiAgICAgICAgICBtZWRpYTogdGhpc3Euc3BsaXQoXCIoXCIpWzBdLm1hdGNoKHJlc3BvbmQucmVnZXgub25seSkgJiYgUmVnRXhwLiQyIHx8IFwiYWxsXCIsXG4gICAgICAgICAgcnVsZXM6IHJ1bGVzLmxlbmd0aCAtIDEsXG4gICAgICAgICAgaGFzcXVlcnk6IHRoaXNxLmluZGV4T2YoXCIoXCIpID4gLTEsXG4gICAgICAgICAgbWludzogdGhpc3EubWF0Y2gocmVzcG9uZC5yZWdleC5taW53KSAmJiBwYXJzZUZsb2F0KFJlZ0V4cC4kMSkgKyAoUmVnRXhwLiQyIHx8IFwiXCIpLFxuICAgICAgICAgIG1heHc6IHRoaXNxLm1hdGNoKHJlc3BvbmQucmVnZXgubWF4dykgJiYgcGFyc2VGbG9hdChSZWdFeHAuJDEpICsgKFJlZ0V4cC4kMiB8fCBcIlwiKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgYXBwbHlNZWRpYSgpO1xuICB9LCBtYWtlUmVxdWVzdHMgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocmVxdWVzdFF1ZXVlLmxlbmd0aCkge1xuICAgICAgdmFyIHRoaXNSZXF1ZXN0ID0gcmVxdWVzdFF1ZXVlLnNoaWZ0KCk7XG4gICAgICBhamF4KHRoaXNSZXF1ZXN0LmhyZWYsIGZ1bmN0aW9uKHN0eWxlcykge1xuICAgICAgICB0cmFuc2xhdGUoc3R5bGVzLCB0aGlzUmVxdWVzdC5ocmVmLCB0aGlzUmVxdWVzdC5tZWRpYSk7XG4gICAgICAgIHBhcnNlZFNoZWV0c1t0aGlzUmVxdWVzdC5ocmVmXSA9IHRydWU7XG4gICAgICAgIHcuc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBtYWtlUmVxdWVzdHMoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHJpcENTUyA9IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzaGVldCA9IGxpbmtzW2ldLCBocmVmID0gc2hlZXQuaHJlZiwgbWVkaWEgPSBzaGVldC5tZWRpYSwgaXNDU1MgPSBzaGVldC5yZWwgJiYgc2hlZXQucmVsLnRvTG93ZXJDYXNlKCkgPT09IFwic3R5bGVzaGVldFwiO1xuICAgICAgaWYgKCEhaHJlZiAmJiBpc0NTUyAmJiAhcGFyc2VkU2hlZXRzW2hyZWZdKSB7XG4gICAgICAgIGlmIChzaGVldC5zdHlsZVNoZWV0ICYmIHNoZWV0LnN0eWxlU2hlZXQucmF3Q3NzVGV4dCkge1xuICAgICAgICAgIHRyYW5zbGF0ZShzaGVldC5zdHlsZVNoZWV0LnJhd0Nzc1RleHQsIGhyZWYsIG1lZGlhKTtcbiAgICAgICAgICBwYXJzZWRTaGVldHNbaHJlZl0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghL14oW2EtekEtWjpdKlxcL1xcLykvLnRlc3QoaHJlZikgJiYgIWJhc2UgfHwgaHJlZi5yZXBsYWNlKFJlZ0V4cC4kMSwgXCJcIikuc3BsaXQoXCIvXCIpWzBdID09PSB3LmxvY2F0aW9uLmhvc3QpIHtcbiAgICAgICAgICAgIGlmIChocmVmLnN1YnN0cmluZygwLCAyKSA9PT0gXCIvL1wiKSB7XG4gICAgICAgICAgICAgIGhyZWYgPSB3LmxvY2F0aW9uLnByb3RvY29sICsgaHJlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVlc3RRdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgICAgaHJlZjogaHJlZixcbiAgICAgICAgICAgICAgbWVkaWE6IG1lZGlhXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgbWFrZVJlcXVlc3RzKCk7XG4gIH07XG4gIHJpcENTUygpO1xuICByZXNwb25kLnVwZGF0ZSA9IHJpcENTUztcbiAgcmVzcG9uZC5nZXRFbVZhbHVlID0gZ2V0RW1WYWx1ZTtcbiAgZnVuY3Rpb24gY2FsbE1lZGlhKCkge1xuICAgIGFwcGx5TWVkaWEodHJ1ZSk7XG4gIH1cbiAgaWYgKHcuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHcuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBjYWxsTWVkaWEsIGZhbHNlKTtcbiAgfSBlbHNlIGlmICh3LmF0dGFjaEV2ZW50KSB7XG4gICAgdy5hdHRhY2hFdmVudChcIm9ucmVzaXplXCIsIGNhbGxNZWRpYSk7XG4gIH1cbn0pKHRoaXMpOyIsIihmdW5jdGlvbiAod2luZG93LCB1bmRlZmluZWQpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAvLyB0ZXN0IGZvciBSRU0gdW5pdCBzdXBwb3J0XG4gICAgdmFyIGNzc3JlbXVuaXQgPSAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuICAgICAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQgPSAnZm9udC1zaXplOiAxcmVtOyc7XG5cbiAgICAgICAgcmV0dXJuICgvcmVtLykudGVzdChkaXYuc3R5bGUuZm9udFNpemUpO1xuICAgIH0sXG5cbiAgICAvLyBmaWx0ZXIgcmV0dXJuZWQgbGlua3MgZm9yIHN0eWxlc2hlZXRzXG4gICAgaXNTdHlsZVNoZWV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3R5bGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpbmsnKSxcbiAgICAgICAgICAgIGZpbHRlcmVkTGlua3MgPSBbXTtcblxuICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICggc3R5bGVzW2ldLnJlbC50b0xvd2VyQ2FzZSgpID09PSAnc3R5bGVzaGVldCcgJiYgc3R5bGVzW2ldLmdldEF0dHJpYnV0ZSgnZGF0YS1ub3JlbScpID09PSBudWxsICkge1xuXG4gICAgICAgICAgICAgICAgZmlsdGVyZWRMaW5rcy5wdXNoKCBzdHlsZXNbaV0uaHJlZiApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkTGlua3M7XG4gICAgfSxcblxuICAgcHJvY2Vzc0xpbmtzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3ByZXBhcmUgdG8gbWF0Y2ggZWFjaCBsaW5rXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgbGlua3MubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICAgIHhociggbGlua3NbaV0sIHN0b3JlQ1NTICk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcmVDU1MgPSBmdW5jdGlvbiAoIHJlc3BvbnNlLCBsaW5rICkge1xuXG4gICAgICAgIHByZUNTUy5wdXNoKHJlc3BvbnNlLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIENTU0xpbmtzLnB1c2gobGluayk7XG5cbiAgICAgICAgaWYoIENTU0xpbmtzLmxlbmd0aCA9PT0gbGlua3MubGVuZ3RoICl7XG4gICAgICAgICAgICBmb3IoIHZhciBqID0gMDsgaiA8ICBDU1NMaW5rcy5sZW5ndGg7IGorKyApe1xuICAgICAgICAgICAgICAgIG1hdGNoQ1NTKCBwcmVDU1Nbal0sIENTU0xpbmtzW2pdICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKCAoIGxpbmtzID0gaW1wb3J0TGlua3Muc2xpY2UoMCkgKS5sZW5ndGggPiAwICl7IC8vYWZ0ZXIgZmluaXNoaW5nIGFsbCBjdXJyZW50IGxpbmtzLCBzZXQgbGlua3MgZXF1YWwgdG8gdGhlIG5ldyBpbXBvcnRzIGZvdW5kXG4gICAgICAgICAgICAgICAgQ1NTTGlua3MgPSBbXTtcbiAgICAgICAgICAgICAgICBwcmVDU1MgPSBbXTtcbiAgICAgICAgICAgICAgICBpbXBvcnRMaW5rcyA9IFtdO1xuICAgICAgICAgICAgICAgIHByb2Nlc3NMaW5rcygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBidWlsZENTUygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIG1hdGNoQ1NTID0gZnVuY3Rpb24gKCBzaGVldENTUywgbGluayApIHsgLy8gY29sbGVjdCBhbGwgb2YgdGhlIHJ1bGVzIGZyb20gdGhlIHhociByZXNwb25zZSB0ZXh0cyBhbmQgbWF0Y2ggdGhlbSB0byBhIHBhdHRlcm5cbiAgICAgICAgdmFyIGNsZWFuID0gcmVtb3ZlTWVkaWFRdWVyaWVzKCBzaGVldENTUyApLnJlcGxhY2UoL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZywgJycpLCAvLyByZW1vdmUgTWVkaWFRdWVyaWVzIGFuZCBjb21tZW50c1xuICAgICAgICAgICAgcGF0dGVybiA9IC9bXFx3XFxkXFxzXFwtXFwvXFxcXFxcW1xcXTosLidcIiooKTw+K34lI14kXz18QF0rXFx7W1xcd1xcZFxcc1xcLVxcL1xcXFwlIzohOywuJ1wiKigpXStcXGQqXFwuP1xcZCtyZW1bXFx3XFxkXFxzXFwtXFwvXFxcXCUjOiE7LC4nXCIqKCldKlxcfS9nLCAvL2ZpbmQgc2VsZWN0b3JzIHRoYXQgdXNlIHJlbSBpbiBvbmUgb3IgbW9yZSBvZiB0aGVpciBydWxlc1xuICAgICAgICAgICAgY3VycmVudCA9IGNsZWFuLm1hdGNoKHBhdHRlcm4pLFxuICAgICAgICAgICAgcmVtUGF0dGVybiA9L1xcZCpcXC4/XFxkK3JlbS9nLFxuICAgICAgICAgICAgcmVtQ3VycmVudCA9IGNsZWFuLm1hdGNoKHJlbVBhdHRlcm4pLFxuICAgICAgICAgICAgc2hlZXRQYXRoUGF0dGVybiA9IC8oLipcXC8pLyxcbiAgICAgICAgICAgIHNoZWV0UGF0aCA9IHNoZWV0UGF0aFBhdHRlcm4uZXhlYyhsaW5rKVswXSwgLy9yZWxhdGl2ZSBwYXRoIHRvIGNzcyBmaWxlIHNwZWNpZmllZCBpbiBAaW1wb3J0XG4gICAgICAgICAgICBpbXBvcnRQYXR0ZXJuID0gL0BpbXBvcnQgKD86dXJsXFwoKT9bJ1wiXT8oW14nXFwpXCJdKilbJ1wiXT9cXCk/W147XSovZ20sIC8vbWF0Y2hlcyBhbGwgQGltcG9ydCB2YXJpYXRpb25zIG91dGxpbmVkIGF0OiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvQGltcG9ydFxuICAgICAgICAgICAgaW1wb3J0U3RhdGVtZW50O1xuXG4gICAgICAgIHdoaWxlKCAoaW1wb3J0U3RhdGVtZW50ID0gaW1wb3J0UGF0dGVybi5leGVjKHNoZWV0Q1NTKSkgIT09IG51bGwgKXtcbiAgICAgICAgICAgIGlmKCBpbXBvcnRTdGF0ZW1lbnRbMV0uaW5kZXhPZihcIi9cIikgPT09IDAgKSB7IC8vIGNoZWNrIGlmIHRoZSB2YWx1ZSBvZiBpbXBvcnRTdGF0ZW1lbnRbMV0gaXMgYSByb290IHJlbGF0aXZlIHBhdGgsIGluIHdoaWNoIGNhc2UgaXQgc2hvdWxkbid0IGJlIGNvbmNhdGVuYXRlZCB3aXRoIHNoZWV0UGF0aFxuICAgICAgICAgICAgICAgIGltcG9ydExpbmtzLnB1c2goIGltcG9ydFN0YXRlbWVudFsxXSApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbXBvcnRMaW5rcy5wdXNoKCBzaGVldFBhdGggKyBpbXBvcnRTdGF0ZW1lbnRbMV0gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCBjdXJyZW50ICE9PSBudWxsICYmIGN1cnJlbnQubGVuZ3RoICE9PSAwICl7XG4gICAgICAgICAgICBmb3VuZCA9IGZvdW5kLmNvbmNhdCggY3VycmVudCApOyAvLyBzYXZlIGFsbCBvZiB0aGUgYmxvY2tzIG9mIHJ1bGVzIHdpdGggcmVtIGluIGEgcHJvcGVydHlcbiAgICAgICAgICAgIGZvdW5kUHJvcHMgPSBmb3VuZFByb3BzLmNvbmNhdCggcmVtQ3VycmVudCApOyAvLyBzYXZlIGFsbCBvZiB0aGUgcHJvcGVydGllcyB3aXRoIHJlbVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGJ1aWxkQ1NTID0gZnVuY3Rpb24gKCkgeyAvLyBmaXJzdCBidWlsZCBlYWNoIGluZGl2aWR1YWwgcnVsZSBmcm9tIGVsZW1lbnRzIGluIHRoZSBmb3VuZCBhcnJheSBhbmQgdGhlbiBhZGQgaXQgdG8gdGhlIHN0cmluZyBvZiBydWxlcy5cbiAgICAgICAgdmFyIHBhdHRlcm4gPSAvW1xcd1xcZFxcc1xcLVxcL1xcXFwlIzosLidcIiooKV0rXFxkKlxcLj9cXGQrcmVtW1xcd1xcZFxcc1xcLVxcL1xcXFwlIzohLC4nXCIqKCldKls7fV0vZzsgLy8gZmluZCBwcm9wZXJ0aWVzIHdpdGggcmVtIHZhbHVlcyBpbiB0aGVtXG4gICAgICAgIGZvciggdmFyIGkgPSAwOyBpIDwgZm91bmQubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICAgIHJ1bGVzID0gcnVsZXMgKyBmb3VuZFtpXS5zdWJzdHIoMCxmb3VuZFtpXS5pbmRleE9mKFwie1wiKSsxKTsgLy8gc2F2ZSB0aGUgc2VsZWN0b3IgcG9ydGlvbiBvZiBlYWNoIHJ1bGUgd2l0aCBhIHJlbSB2YWx1ZVxuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSBmb3VuZFtpXS5tYXRjaCggcGF0dGVybiApO1xuICAgICAgICAgICAgZm9yKCB2YXIgaiA9IDA7IGo8Y3VycmVudC5sZW5ndGg7IGorKyApeyAvLyBidWlsZCBhIG5ldyBzZXQgb2Ygd2l0aCBvbmx5IHRoZSBzZWxlY3RvciBhbmQgcHJvcGVydGllcyB0aGF0IGhhdmUgcmVtIGluIHRoZSB2YWx1ZVxuICAgICAgICAgICAgICAgIHJ1bGVzID0gcnVsZXMgKyBjdXJyZW50W2pdO1xuICAgICAgICAgICAgICAgIGlmKCBqID09PSBjdXJyZW50Lmxlbmd0aC0xICYmIHJ1bGVzW3J1bGVzLmxlbmd0aC0xXSAhPT0gXCJ9XCIgKXtcbiAgICAgICAgICAgICAgICAgICAgcnVsZXMgPSBydWxlcyArIFwiXFxufVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHBhcnNlQ1NTKCk7XG4gICAgfSxcblxuICAgIHBhcnNlQ1NTID0gZnVuY3Rpb24gKCkgeyAvLyByZXBsYWNlIGVhY2ggc2V0IG9mIHBhcmVudGhlc2VzIHdpdGggZXZhbHVhdGVkIGNvbnRlbnRcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBmb3VuZFByb3BzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgICBjc3NbaV0gPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KGZvdW5kUHJvcHNbaV0uc3Vic3RyKDAsZm91bmRQcm9wc1tpXS5sZW5ndGgtMykqZm9udFNpemUpICkgKyAncHgnO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9hZENTUygpO1xuICAgIH0sXG5cbiAgICBsb2FkQ1NTID0gZnVuY3Rpb24gKCkgeyAvLyByZXBsYWNlIGFuZCBsb2FkIHRoZSBuZXcgcnVsZXNcbiAgICAgICAgZm9yKCB2YXIgaSA9IDA7IGkgPCBjc3MubGVuZ3RoOyBpKysgKXsgLy8gb25seSBydW4gdGhpcyBsb29wIGFzIG1hbnkgdGltZXMgYXMgY3NzIGhhcyBlbnRyaWVzXG4gICAgICAgICAgICBpZiggY3NzW2ldICl7XG4gICAgICAgICAgICAgICAgcnVsZXMgPSBydWxlcy5yZXBsYWNlKCBmb3VuZFByb3BzW2ldLGNzc1tpXSApOyAvLyByZXBsYWNlIG9sZCBydWxlcyB3aXRoIG91ciBwcm9jZXNzZWQgcnVsZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVtY3NzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3N0eWxlJyApO1xuICAgICAgICByZW1jc3Muc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0L2NzcycgKTtcbiAgICAgICAgcmVtY3NzLmlkID0gJ3JlbVJlcGxhY2UnO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSggJ2hlYWQnIClbMF0uYXBwZW5kQ2hpbGQoIHJlbWNzcyApOyAgIC8vIGNyZWF0ZSB0aGUgbmV3IGVsZW1lbnRcbiAgICAgICAgaWYoIHJlbWNzcy5zdHlsZVNoZWV0ICkge1xuICAgICAgICAgICAgcmVtY3NzLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHJ1bGVzOyAvLyBJRTggd2lsbCBub3Qgc3VwcG9ydCBpbm5lckhUTUwgb24gcmVhZC1vbmx5IGVsZW1lbnRzLCBzdWNoIGFzIFNUWUxFXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZW1jc3MuYXBwZW5kQ2hpbGQoIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCBydWxlcyApICk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgeGhyID0gZnVuY3Rpb24gKCB1cmwsIGNhbGxiYWNrICkgeyAvLyBjcmVhdGUgbmV3IFhNTEh0dHBSZXF1ZXN0IG9iamVjdCBhbmQgcnVuIGl0XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL3RyeSB0byBjcmVhdGUgYSByZXF1ZXN0IG9iamVjdFxuICAgICAgICAgICAgLy9hcnJhbmdpbmcgdGhlIHR3byBjb25kaXRpb25zIHRoaXMgd2F5IGlzIGZvciBJRTcvOCdzIGJlbmVmaXRcbiAgICAgICAgICAgIC8vc28gdGhhdCBpdCB3b3JrcyB3aXRoIGFueSBjb21iaW5hdGlvbiBvZiBBY3RpdmVYIG9yIE5hdGl2ZSBYSFIgc2V0dGluZ3MsIFxuICAgICAgICAgICAgLy9hcyBsb25nIGFzIG9uZSBvciB0aGUgb3RoZXIgaXMgZW5hYmxlZDsgYnV0IGlmIGJvdGggYXJlIGVuYWJsZWRcbiAgICAgICAgICAgIC8vaXQgcHJlZmVycyBBY3RpdmVYLCB3aGljaCBtZWFucyBpdCBzdGlsbCB3b3JrcyB3aXRoIGxvY2FsIGZpbGVzXG4gICAgICAgICAgICAvLyhOYXRpdmUgWEhSIGluIElFNy84IGlzIGJsb2NrZWQgYW5kIHRocm93cyBcImFjY2VzcyBpcyBkZW5pZWRcIixcbiAgICAgICAgICAgIC8vIGJ1dCBBY3RpdmVYIGlzIHBlcm1pdHRlZCBpZiB0aGUgdXNlciBhbGxvd3MgaXQgW2RlZmF1bHQgaXMgdG8gcHJvbXB0XSlcbiAgICAgICAgICAgIHZhciB4aHIgPSB3aW5kb3cuQWN0aXZlWE9iamVjdCA/ICggbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJykgfHwgbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQJykgKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgICB4aHIub3BlbiggJ0dFVCcsIHVybCwgdHJ1ZSApO1xuICAgICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICggeGhyLnJlYWR5U3RhdGUgPT09IDQgKXtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soeGhyLCB1cmwpO1xuICAgICAgICAgICAgICAgIH0gLy8gZWxzZSB7IGNhbGxiYWNrIGZ1bmN0aW9uIG9uIEFKQVggZXJyb3IgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgeGhyLnNlbmQoIG51bGwgKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICBpZiAoIHdpbmRvdy5YRG9tYWluUmVxdWVzdCApIHtcbiAgICAgICAgICAgICAgICB2YXIgeGRyID0gbmV3IFhEb21haW5SZXF1ZXN0KCk7XG4gICAgICAgICAgICAgICAgeGRyLm9wZW4oJ2dldCcsIHVybCk7XG4gICAgICAgICAgICAgICAgeGRyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayh4ZHIsIHVybCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB4ZHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIHhkciBsb2FkIGZhaWxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHhkci5zZW5kKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8gUmVtb3ZlIHF1ZXJpZXMuXG4gICAgcmVtb3ZlTWVkaWFRdWVyaWVzID0gZnVuY3Rpb24oY3NzKSB7XG4gICAgICAgIC8vIFRlc3QgZm9yIE1lZGlhIFF1ZXJ5IHN1cHBvcnRcbiAgICAgICAgaWYgKCAhd2luZG93Lm1hdGNoTWVkaWEgJiYgIXdpbmRvdy5tc01hdGNoTWVkaWEgKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnQgbWVkaWEgcXVlcmllcywgd2UgZmluZCBhbGwgQG1lZGlhIGRlY2xhcmF0aW9ucyBpbiB0aGUgQ1NTIGFuZCByZW1vdmUgdGhlbS5cbiAgICAgICAgICAgIC8vIE5vdGU6IFNpbmNlIEBydWxlcyBjYW4ndCBiZSBuZXN0ZWQgaW4gdGhlIENTUyBzcGVjLCB3ZSdyZSBzYWZlIHRvIGp1c3QgY2hlY2sgZm9yIHRoZSBjbG9zZXN0IGZvbGxvd2luZyBcIn19XCIgdG8gdGhlIFwiQG1lZGlhXCIuXG4gICAgICAgICAgICBjc3MgPSBjc3MucmVwbGFjZSgvQG1lZGlhW1xcc1xcU10qP1xcfVxccypcXH0vZywgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY3NzO1xuICAgIH07XG5cbiAgICBpZiggIWNzc3JlbXVuaXQoKSApeyAvLyB0aGlzIGNoZWNrcyBpZiB0aGUgcmVtIHZhbHVlIGlzIHN1cHBvcnRlZFxuICAgICAgICB2YXIgcnVsZXMgPSAnJywgLy8gaW5pdGlhbGl6ZSB0aGUgcnVsZXMgdmFyaWFibGUgaW4gdGhpcyBzY29wZSBzbyBpdCBjYW4gYmUgdXNlZCBsYXRlclxuICAgICAgICAgICAgbGlua3MgPSBpc1N0eWxlU2hlZXQoKSwgLy8gaW5pdGlhbGl6ZSB0aGUgYXJyYXkgaG9sZGluZyB0aGUgc2hlZXRzIHVybHMgZm9yIHVzZSBsYXRlclxuICAgICAgICAgICAgaW1wb3J0TGlua3MgPSBbXSwgLy9pbml0aWFsaXplIHRoZSBhcnJheSBob2xkaW5nIHRoZSBpbXBvcnQgc2hlZXQgdXJscyBmb3IgdXNlIGxhdGVyXG4gICAgICAgICAgICBmb3VuZCA9IFtdLCAvLyBpbml0aWFsaXplIHRoZSBhcnJheSBob2xkaW5nIHRoZSBmb3VuZCBydWxlcyBmb3IgdXNlIGxhdGVyXG4gICAgICAgICAgICBmb3VuZFByb3BzID0gW10sIC8vIGluaXRpYWxpemUgdGhlIGFycmF5IGhvbGRpbmcgdGhlIGZvdW5kIHByb3BlcnRpZXMgZm9yIHVzZSBsYXRlclxuICAgICAgICAgICAgcHJlQ1NTID0gW10sIC8vIGluaXRpYWxpemUgYXJyYXkgdGhhdCBob2xkcyBjc3MgYmVmb3JlIGJlaW5nIHBhcnNlZFxuICAgICAgICAgICAgQ1NTTGlua3MgPSBbXSwgLy9pbml0aWFsaXplIGFycmF5IGhvbGRpbmcgY3NzIGxpbmtzIHJldHVybmVkIGZyb20geGhyXG4gICAgICAgICAgICBjc3MgPSBbXSwgLy8gaW5pdGlhbGl6ZSB0aGUgYXJyYXkgaG9sZGluZyB0aGUgcGFyc2VkIHJ1bGVzIGZvciB1c2UgbGF0ZXJcbiAgICAgICAgICAgIGZvbnRTaXplID0gJyc7XG5cbiAgICAgICAgLy8gTm90aWNlOiByZW0gaXMgYSBcInJvb3QgZW1cIiB0aGF0IG1lYW5zIHRoYXQgaW4gY2FzZSB3aGVuIGh0bWwgZWxlbWVudCBzaXplIHdhcyBjaGFuZ2VkIGJ5IGNzc1xuICAgICAgICAvLyBvciBzdHlsZSB3ZSBzaG91bGQgbm90IGNoYW5nZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZm9udFNpemUgdG8gMWVtIC0gb25seSBib2R5IHNpemUgc2hvdWxkIGJlIGNoYW5nZWRcbiAgICAgICAgLy8gdG8gMWVtIGZvciBjYWxjdWxhdGlvblxuXG4gICAgICAgIGZvbnRTaXplID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkb2MgPSBkb2N1bWVudCxcbiAgICAgICAgICAgICAgICBkb2NFbGVtZW50ID0gZG9jLmRvY3VtZW50RWxlbWVudCxcbiAgICAgICAgICAgICAgICBib2R5ID0gZG9jLmJvZHkgfHwgZG9jLmNyZWF0ZUVsZW1lbnQoJ2JvZHknKSxcbiAgICAgICAgICAgICAgICBpc0Zha2VCb2R5ID0gIWRvYy5ib2R5LFxuICAgICAgICAgICAgICAgIGRpdiA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2l6ZSA9IGJvZHkuc3R5bGUuZm9udFNpemUsXG4gICAgICAgICAgICAgICAgc2l6ZTtcblxuICAgICAgICAgICAgaWYgKCBpc0Zha2VCb2R5ICkge1xuICAgICAgICAgICAgICAgIGRvY0VsZW1lbnQuYXBwZW5kQ2hpbGQoIGJvZHkgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZGl2LnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6MWVtOyBwb3NpdGlvbjphYnNvbHV0ZTsgdmlzaWJpbGl0eTpoaWRkZW47IHBhZGRpbmc6IDA7JztcblxuICAgICAgICAgICAgYm9keS5zdHlsZS5mb250U2l6ZSA9ICcxZW0nO1xuXG4gICAgICAgICAgICBib2R5LmFwcGVuZENoaWxkKCBkaXYgKTtcbiAgICAgICAgICAgIHNpemUgPSBkaXYub2Zmc2V0V2lkdGg7XG5cbiAgICAgICAgICAgIGlmICggaXNGYWtlQm9keSApIHtcbiAgICAgICAgICAgICAgICBkb2NFbGVtZW50LnJlbW92ZUNoaWxkKCBib2R5ICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcbiAgICAgICAgICAgICAgICBib2R5LnN0eWxlLmZvbnRTaXplID0gY3VycmVudFNpemU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzaXplO1xuICAgICAgICB9KCkpO1xuXG4gICAgICAgIHByb2Nlc3NMaW5rcygpO1xuICAgIH0gLy8gZWxzZSB7IGRvIG5vdGhpbmcsIHlvdSBhcmUgYXdlc29tZSBhbmQgaGF2ZSBSRU0gc3VwcG9ydCB9XG5cbn0pKHdpbmRvdyk7XG4iLCIvKlxuICogcmFmLmpzXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbmdyeW1hbi9yYWYuanNcbiAqXG4gKiBvcmlnaW5hbCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgcG9seWZpbGwgYnkgRXJpayBNw7ZsbGVyXG4gKiBpbnNwaXJlZCBmcm9tIHBhdWxfaXJpc2ggZ2lzdCBhbmQgcG9zdFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMyBuZ3J5bWFuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuKGZ1bmN0aW9uKHdpbmRvdykge1xuXHR2YXIgbGFzdFRpbWUgPSAwLFxuXHRcdHZlbmRvcnMgPSBbJ3dlYmtpdCcsICdtb3onXSxcblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuXHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lLFxuXHRcdGkgPSB2ZW5kb3JzLmxlbmd0aDtcblxuXHQvLyB0cnkgdG8gdW4tcHJlZml4IGV4aXN0aW5nIHJhZlxuXHR3aGlsZSAoLS1pID49IDAgJiYgIXJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvd1t2ZW5kb3JzW2ldICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuXHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZlbmRvcnNbaV0gKyAnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXTtcblx0fVxuXG5cdC8vIHBvbHlmaWxsIHdpdGggc2V0VGltZW91dCBmYWxsYmFja1xuXHQvLyBoZWF2aWx5IGluc3BpcmVkIGZyb20gQGRhcml1cyBnaXN0IG1vZDogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzE1Nzk2NzEjY29tbWVudC04Mzc5NDVcblx0aWYgKCFyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIWNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHRcdHZhciBub3cgPSArbmV3IERhdGUoKSwgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuXHRcdFx0cmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGxhc3RUaW1lID0gbmV4dFRpbWUpO1xuXHRcdFx0fSwgbmV4dFRpbWUgLSBub3cpO1xuXHRcdH07XG5cblx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcblx0fVxuXG5cdC8vIGV4cG9ydCB0byB3aW5kb3dcblx0d2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0d2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2FuY2VsQW5pbWF0aW9uRnJhbWU7XG59KHdpbmRvdykpO1xuIiwiLypcbiAqIGNsYXNzTGlzdC5qczogQ3Jvc3MtYnJvd3NlciBmdWxsIGVsZW1lbnQuY2xhc3NMaXN0IGltcGxlbWVudGF0aW9uLlxuICogMjAxNC0xMi0xM1xuICpcbiAqIEJ5IEVsaSBHcmV5LCBodHRwOi8vZWxpZ3JleS5jb21cbiAqIFB1YmxpYyBEb21haW4uXG4gKiBOTyBXQVJSQU5UWSBFWFBSRVNTRUQgT1IgSU1QTElFRC4gVVNFIEFUIFlPVVIgT1dOIFJJU0suXG4gKi9cblxuLypnbG9iYWwgc2VsZiwgZG9jdW1lbnQsIERPTUV4Y2VwdGlvbiAqL1xuXG4vKiEgQHNvdXJjZSBodHRwOi8vcHVybC5lbGlncmV5LmNvbS9naXRodWIvY2xhc3NMaXN0LmpzL2Jsb2IvbWFzdGVyL2NsYXNzTGlzdC5qcyAqL1xuXG5pZiAoXCJkb2N1bWVudFwiIGluIHNlbGYpIHtcblxuLy8gRnVsbCBwb2x5ZmlsbCBmb3IgYnJvd3NlcnMgd2l0aCBubyBjbGFzc0xpc3Qgc3VwcG9ydFxuaWYgKCEoXCJjbGFzc0xpc3RcIiBpbiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKSkpIHtcblxuKGZ1bmN0aW9uICh2aWV3KSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5pZiAoISgnRWxlbWVudCcgaW4gdmlldykpIHJldHVybjtcblxudmFyXG5cdCAgY2xhc3NMaXN0UHJvcCA9IFwiY2xhc3NMaXN0XCJcblx0LCBwcm90b1Byb3AgPSBcInByb3RvdHlwZVwiXG5cdCwgZWxlbUN0clByb3RvID0gdmlldy5FbGVtZW50W3Byb3RvUHJvcF1cblx0LCBvYmpDdHIgPSBPYmplY3Rcblx0LCBzdHJUcmltID0gU3RyaW5nW3Byb3RvUHJvcF0udHJpbSB8fCBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRoaXMucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgXCJcIik7XG5cdH1cblx0LCBhcnJJbmRleE9mID0gQXJyYXlbcHJvdG9Qcm9wXS5pbmRleE9mIHx8IGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0dmFyXG5cdFx0XHQgIGkgPSAwXG5cdFx0XHQsIGxlbiA9IHRoaXMubGVuZ3RoXG5cdFx0O1xuXHRcdGZvciAoOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGlmIChpIGluIHRoaXMgJiYgdGhpc1tpXSA9PT0gaXRlbSkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIC0xO1xuXHR9XG5cdC8vIFZlbmRvcnM6IHBsZWFzZSBhbGxvdyBjb250ZW50IGNvZGUgdG8gaW5zdGFudGlhdGUgRE9NRXhjZXB0aW9uc1xuXHQsIERPTUV4ID0gZnVuY3Rpb24gKHR5cGUsIG1lc3NhZ2UpIHtcblx0XHR0aGlzLm5hbWUgPSB0eXBlO1xuXHRcdHRoaXMuY29kZSA9IERPTUV4Y2VwdGlvblt0eXBlXTtcblx0XHR0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXHR9XG5cdCwgY2hlY2tUb2tlbkFuZEdldEluZGV4ID0gZnVuY3Rpb24gKGNsYXNzTGlzdCwgdG9rZW4pIHtcblx0XHRpZiAodG9rZW4gPT09IFwiXCIpIHtcblx0XHRcdHRocm93IG5ldyBET01FeChcblx0XHRcdFx0ICBcIlNZTlRBWF9FUlJcIlxuXHRcdFx0XHQsIFwiQW4gaW52YWxpZCBvciBpbGxlZ2FsIHN0cmluZyB3YXMgc3BlY2lmaWVkXCJcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmICgvXFxzLy50ZXN0KHRva2VuKSkge1xuXHRcdFx0dGhyb3cgbmV3IERPTUV4KFxuXHRcdFx0XHQgIFwiSU5WQUxJRF9DSEFSQUNURVJfRVJSXCJcblx0XHRcdFx0LCBcIlN0cmluZyBjb250YWlucyBhbiBpbnZhbGlkIGNoYXJhY3RlclwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gYXJySW5kZXhPZi5jYWxsKGNsYXNzTGlzdCwgdG9rZW4pO1xuXHR9XG5cdCwgQ2xhc3NMaXN0ID0gZnVuY3Rpb24gKGVsZW0pIHtcblx0XHR2YXJcblx0XHRcdCAgdHJpbW1lZENsYXNzZXMgPSBzdHJUcmltLmNhbGwoZWxlbS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiKVxuXHRcdFx0LCBjbGFzc2VzID0gdHJpbW1lZENsYXNzZXMgPyB0cmltbWVkQ2xhc3Nlcy5zcGxpdCgvXFxzKy8pIDogW11cblx0XHRcdCwgaSA9IDBcblx0XHRcdCwgbGVuID0gY2xhc3Nlcy5sZW5ndGhcblx0XHQ7XG5cdFx0Zm9yICg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dGhpcy5wdXNoKGNsYXNzZXNbaV0pO1xuXHRcdH1cblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRlbGVtLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMudG9TdHJpbmcoKSk7XG5cdFx0fTtcblx0fVxuXHQsIGNsYXNzTGlzdFByb3RvID0gQ2xhc3NMaXN0W3Byb3RvUHJvcF0gPSBbXVxuXHQsIGNsYXNzTGlzdEdldHRlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbmV3IENsYXNzTGlzdCh0aGlzKTtcblx0fVxuO1xuLy8gTW9zdCBET01FeGNlcHRpb24gaW1wbGVtZW50YXRpb25zIGRvbid0IGFsbG93IGNhbGxpbmcgRE9NRXhjZXB0aW9uJ3MgdG9TdHJpbmcoKVxuLy8gb24gbm9uLURPTUV4Y2VwdGlvbnMuIEVycm9yJ3MgdG9TdHJpbmcoKSBpcyBzdWZmaWNpZW50IGhlcmUuXG5ET01FeFtwcm90b1Byb3BdID0gRXJyb3JbcHJvdG9Qcm9wXTtcbmNsYXNzTGlzdFByb3RvLml0ZW0gPSBmdW5jdGlvbiAoaSkge1xuXHRyZXR1cm4gdGhpc1tpXSB8fCBudWxsO1xufTtcbmNsYXNzTGlzdFByb3RvLmNvbnRhaW5zID0gZnVuY3Rpb24gKHRva2VuKSB7XG5cdHRva2VuICs9IFwiXCI7XG5cdHJldHVybiBjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pICE9PSAtMTtcbn07XG5jbGFzc0xpc3RQcm90by5hZGQgPSBmdW5jdGlvbiAoKSB7XG5cdHZhclxuXHRcdCAgdG9rZW5zID0gYXJndW1lbnRzXG5cdFx0LCBpID0gMFxuXHRcdCwgbCA9IHRva2Vucy5sZW5ndGhcblx0XHQsIHRva2VuXG5cdFx0LCB1cGRhdGVkID0gZmFsc2Vcblx0O1xuXHRkbyB7XG5cdFx0dG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuXHRcdGlmIChjaGVja1Rva2VuQW5kR2V0SW5kZXgodGhpcywgdG9rZW4pID09PSAtMSkge1xuXHRcdFx0dGhpcy5wdXNoKHRva2VuKTtcblx0XHRcdHVwZGF0ZWQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHR3aGlsZSAoKytpIDwgbCk7XG5cblx0aWYgKHVwZGF0ZWQpIHtcblx0XHR0aGlzLl91cGRhdGVDbGFzc05hbWUoKTtcblx0fVxufTtcbmNsYXNzTGlzdFByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcblx0dmFyXG5cdFx0ICB0b2tlbnMgPSBhcmd1bWVudHNcblx0XHQsIGkgPSAwXG5cdFx0LCBsID0gdG9rZW5zLmxlbmd0aFxuXHRcdCwgdG9rZW5cblx0XHQsIHVwZGF0ZWQgPSBmYWxzZVxuXHRcdCwgaW5kZXhcblx0O1xuXHRkbyB7XG5cdFx0dG9rZW4gPSB0b2tlbnNbaV0gKyBcIlwiO1xuXHRcdGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcblx0XHR3aGlsZSAoaW5kZXggIT09IC0xKSB7XG5cdFx0XHR0aGlzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR1cGRhdGVkID0gdHJ1ZTtcblx0XHRcdGluZGV4ID0gY2hlY2tUb2tlbkFuZEdldEluZGV4KHRoaXMsIHRva2VuKTtcblx0XHR9XG5cdH1cblx0d2hpbGUgKCsraSA8IGwpO1xuXG5cdGlmICh1cGRhdGVkKSB7XG5cdFx0dGhpcy5fdXBkYXRlQ2xhc3NOYW1lKCk7XG5cdH1cbn07XG5jbGFzc0xpc3RQcm90by50b2dnbGUgPSBmdW5jdGlvbiAodG9rZW4sIGZvcmNlKSB7XG5cdHRva2VuICs9IFwiXCI7XG5cblx0dmFyXG5cdFx0ICByZXN1bHQgPSB0aGlzLmNvbnRhaW5zKHRva2VuKVxuXHRcdCwgbWV0aG9kID0gcmVzdWx0ID9cblx0XHRcdGZvcmNlICE9PSB0cnVlICYmIFwicmVtb3ZlXCJcblx0XHQ6XG5cdFx0XHRmb3JjZSAhPT0gZmFsc2UgJiYgXCJhZGRcIlxuXHQ7XG5cblx0aWYgKG1ldGhvZCkge1xuXHRcdHRoaXNbbWV0aG9kXSh0b2tlbik7XG5cdH1cblxuXHRpZiAoZm9yY2UgPT09IHRydWUgfHwgZm9yY2UgPT09IGZhbHNlKSB7XG5cdFx0cmV0dXJuIGZvcmNlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiAhcmVzdWx0O1xuXHR9XG59O1xuY2xhc3NMaXN0UHJvdG8udG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cdHJldHVybiB0aGlzLmpvaW4oXCIgXCIpO1xufTtcblxuaWYgKG9iakN0ci5kZWZpbmVQcm9wZXJ0eSkge1xuXHR2YXIgY2xhc3NMaXN0UHJvcERlc2MgPSB7XG5cdFx0ICBnZXQ6IGNsYXNzTGlzdEdldHRlclxuXHRcdCwgZW51bWVyYWJsZTogdHJ1ZVxuXHRcdCwgY29uZmlndXJhYmxlOiB0cnVlXG5cdH07XG5cdHRyeSB7XG5cdFx0b2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuXHR9IGNhdGNoIChleCkgeyAvLyBJRSA4IGRvZXNuJ3Qgc3VwcG9ydCBlbnVtZXJhYmxlOnRydWVcblx0XHRpZiAoZXgubnVtYmVyID09PSAtMHg3RkY1RUM1NCkge1xuXHRcdFx0Y2xhc3NMaXN0UHJvcERlc2MuZW51bWVyYWJsZSA9IGZhbHNlO1xuXHRcdFx0b2JqQ3RyLmRlZmluZVByb3BlcnR5KGVsZW1DdHJQcm90bywgY2xhc3NMaXN0UHJvcCwgY2xhc3NMaXN0UHJvcERlc2MpO1xuXHRcdH1cblx0fVxufSBlbHNlIGlmIChvYmpDdHJbcHJvdG9Qcm9wXS5fX2RlZmluZUdldHRlcl9fKSB7XG5cdGVsZW1DdHJQcm90by5fX2RlZmluZUdldHRlcl9fKGNsYXNzTGlzdFByb3AsIGNsYXNzTGlzdEdldHRlcik7XG59XG5cbn0oc2VsZikpO1xuXG59IGVsc2Uge1xuLy8gVGhlcmUgaXMgZnVsbCBvciBwYXJ0aWFsIG5hdGl2ZSBjbGFzc0xpc3Qgc3VwcG9ydCwgc28ganVzdCBjaGVjayBpZiB3ZSBuZWVkXG4vLyB0byBub3JtYWxpemUgdGhlIGFkZC9yZW1vdmUgYW5kIHRvZ2dsZSBBUElzLlxuXG4oZnVuY3Rpb24gKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHR2YXIgdGVzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiX1wiKTtcblxuXHR0ZXN0RWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiYzFcIiwgXCJjMlwiKTtcblxuXHQvLyBQb2x5ZmlsbCBmb3IgSUUgMTAvMTEgYW5kIEZpcmVmb3ggPDI2LCB3aGVyZSBjbGFzc0xpc3QuYWRkIGFuZFxuXHQvLyBjbGFzc0xpc3QucmVtb3ZlIGV4aXN0IGJ1dCBzdXBwb3J0IG9ubHkgb25lIGFyZ3VtZW50IGF0IGEgdGltZS5cblx0aWYgKCF0ZXN0RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoXCJjMlwiKSkge1xuXHRcdHZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbihtZXRob2QpIHtcblx0XHRcdHZhciBvcmlnaW5hbCA9IERPTVRva2VuTGlzdC5wcm90b3R5cGVbbWV0aG9kXTtcblxuXHRcdFx0RE9NVG9rZW5MaXN0LnByb3RvdHlwZVttZXRob2RdID0gZnVuY3Rpb24odG9rZW4pIHtcblx0XHRcdFx0dmFyIGksIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRcdFx0dG9rZW4gPSBhcmd1bWVudHNbaV07XG5cdFx0XHRcdFx0b3JpZ2luYWwuY2FsbCh0aGlzLCB0b2tlbik7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fTtcblx0XHRjcmVhdGVNZXRob2QoJ2FkZCcpO1xuXHRcdGNyZWF0ZU1ldGhvZCgncmVtb3ZlJyk7XG5cdH1cblxuXHR0ZXN0RWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKFwiYzNcIiwgZmFsc2UpO1xuXG5cdC8vIFBvbHlmaWxsIGZvciBJRSAxMCBhbmQgRmlyZWZveCA8MjQsIHdoZXJlIGNsYXNzTGlzdC50b2dnbGUgZG9lcyBub3Rcblx0Ly8gc3VwcG9ydCB0aGUgc2Vjb25kIGFyZ3VtZW50LlxuXHRpZiAodGVzdEVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYzNcIikpIHtcblx0XHR2YXIgX3RvZ2dsZSA9IERPTVRva2VuTGlzdC5wcm90b3R5cGUudG9nZ2xlO1xuXG5cdFx0RE9NVG9rZW5MaXN0LnByb3RvdHlwZS50b2dnbGUgPSBmdW5jdGlvbih0b2tlbiwgZm9yY2UpIHtcblx0XHRcdGlmICgxIGluIGFyZ3VtZW50cyAmJiAhdGhpcy5jb250YWlucyh0b2tlbikgPT09ICFmb3JjZSkge1xuXHRcdFx0XHRyZXR1cm4gZm9yY2U7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gX3RvZ2dsZS5jYWxsKHRoaXMsIHRva2VuKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdH1cblxuXHR0ZXN0RWxlbWVudCA9IG51bGw7XG59KCkpO1xuXG59XG5cbn1cblxuIiwiaWYgKCFBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xuXHRBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uKGVsdCAvKiwgZnJvbSovKSB7XG4gICAgXHR2YXIgbGVuID0gdGhpcy5sZW5ndGggPj4+IDA7XG4gICAgXHR2YXIgZnJvbSA9IE51bWJlcihhcmd1bWVudHNbMV0pIHx8IDA7XG4gICAgXHRmcm9tID0gKGZyb20gPCAwKSA/IE1hdGguY2VpbChmcm9tKSA6IE1hdGguZmxvb3IoZnJvbSk7XG4gICAgXHRpZiAoZnJvbSA8IDApIGZyb20gKz0gbGVuO1xuICAgIFx0Zm9yICg7IGZyb20gPCBsZW47IGZyb20rKyl7XG4gICAgICBcdFx0aWYgKGZyb20gaW4gdGhpcyAmJiB0aGlzW2Zyb21dID09PSBlbHQpIHJldHVybiBmcm9tO1xuICAgIFx0fVxuICAgIHJldHVybiAtMTtcbiAgfTtcbn0iLCIvLyBGdW5jdGlvbi5iaW5kIFBvbHlmaWxsXG4vLyBTb3VyY2U6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Z1bmN0aW9uL2JpbmRcbi8vIE5vdGU6IEkgY291bGRuJ3QgZmluZCBhIGdvb2QgQm93ZXIgcGFja2FnZSwgc28gSSBoYWQgdG8gdXNlIHRoaXMgaW5zdGVhZC5cbi8vIFxuLy8gVGhlIHJlYXNvbiBmb3IgY2xhc3NMaXN0LCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGFuZCBGdW5jdGlvbi5iaW5kIHBvbHlmaWxscyBpcyB0byBzdXBwb3J0XG4vLyBoZWFkcm9vbS5qcy5cblxuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICAgIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kID0gZnVuY3Rpb24ob1RoaXMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgICAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYUFyZ3MgICA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgIGZUb0JpbmQgPSB0aGlzLFxuICAgICAgICBmTk9QICAgID0gZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgZkJvdW5kICA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICA6IG9UaGlzLFxuICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKHRoaXMucHJvdG90eXBlKSB7XG4gICAgICAgICAgICAvLyBGdW5jdGlvbi5wcm90b3R5cGUgZG9lc24ndCBoYXZlIGEgcHJvdG90eXBlIHByb3BlcnR5XG4gICAgICAgICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlOyBcbiAgICAgICAgfVxuICAgICAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgICAgICByZXR1cm4gZkJvdW5kO1xuICAgIH07XG59Il19
