/*!
 * modernizr v3.6.0
 * Build https://modernizr.com/download?-csstransforms-csstransitions-hashchange-inputtypes-objectfit-placeholder-svgasimg-touchevents-addtest-fnbind-mq-printshiv-setclasses-testprop-dontmin
 *
 * Copyright (c)
 *  Faruk Ates
 *  Paul Irish
 *  Alex Sexton
 *  Ryan Seddon
 *  Patrick Kettner
 *  Stu Cox
 *  Richard Herrera

 * MIT License
 */

/*
 * Modernizr tests which native CSS3 and HTML5 features are available in the
 * current UA and makes the results available to you in two ways: as properties on
 * a global `Modernizr` object, and as classes on the `<html>` element. This
 * information allows you to progressively enhance your pages with a granular level
 * of control over the experience.
*/

;(function(window, document, undefined){
  var tests = [];
  

  /**
   *
   * ModernizrProto is the constructor for Modernizr
   *
   * @class
   * @access public
   */

  var ModernizrProto = {
    // The current version, dummy
    _version: '3.6.0',

    // Any settings that don't work as separate modules
    // can go in here as configuration.
    _config: {
      'classPrefix': '',
      'enableClasses': true,
      'enableJSClass': true,
      'usePrefixes': true
    },

    // Queue of tests
    _q: [],

    // Stub these for people who are listening
    on: function(test, cb) {
      // I don't really think people should do this, but we can
      // safe guard it a bit.
      // -- NOTE:: this gets WAY overridden in src/addTest for actual async tests.
      // This is in case people listen to synchronous tests. I would leave it out,
      // but the code to *disallow* sync tests in the real version of this
      // function is actually larger than this.
      var self = this;
      setTimeout(function() {
        cb(self[test]);
      }, 0);
    },

    addTest: function(name, fn, options) {
      tests.push({name: name, fn: fn, options: options});
    },

    addAsyncTest: function(fn) {
      tests.push({name: null, fn: fn});
    }
  };

  

  // Fake some of Object.create so we can force non test results to be non "own" properties.
  var Modernizr = function() {};
  Modernizr.prototype = ModernizrProto;

  // Leak modernizr globally when you `require` it rather than force it here.
  // Overwrite name so constructor name is nicer :D
  Modernizr = new Modernizr();

  

  var classes = [];
  

  /**
   * is returns a boolean if the typeof an obj is exactly type.
   *
   * @access private
   * @function is
   * @param {*} obj - A thing we want to check the type of
   * @param {string} type - A string to compare the typeof against
   * @returns {boolean}
   */

  function is(obj, type) {
    return typeof obj === type;
  }
  ;

  /**
   * Run through all tests and detect their support in the current UA.
   *
   * @access private
   */

  function testRunner() {
    var featureNames;
    var feature;
    var aliasIdx;
    var result;
    var nameIdx;
    var featureName;
    var featureNameSplit;

    for (var featureIdx in tests) {
      if (tests.hasOwnProperty(featureIdx)) {
        featureNames = [];
        feature = tests[featureIdx];
        // run the test, throw the return value into the Modernizr,
        // then based on that boolean, define an appropriate className
        // and push it into an array of classes we'll join later.
        //
        // If there is no name, it's an 'async' test that is run,
        // but not directly added to the object. That should
        // be done with a post-run addTest call.
        if (feature.name) {
          featureNames.push(feature.name.toLowerCase());

          if (feature.options && feature.options.aliases && feature.options.aliases.length) {
            // Add all the aliases into the names list
            for (aliasIdx = 0; aliasIdx < feature.options.aliases.length; aliasIdx++) {
              featureNames.push(feature.options.aliases[aliasIdx].toLowerCase());
            }
          }
        }

        // Run the test, or use the raw value if it's not a function
        result = is(feature.fn, 'function') ? feature.fn() : feature.fn;


        // Set each of the names on the Modernizr object
        for (nameIdx = 0; nameIdx < featureNames.length; nameIdx++) {
          featureName = featureNames[nameIdx];
          // Support dot properties as sub tests. We don't do checking to make sure
          // that the implied parent tests have been added. You must call them in
          // order (either in the test, or make the parent test a dependency).
          //
          // Cap it to TWO to make the logic simple and because who needs that kind of subtesting
          // hashtag famous last words
          featureNameSplit = featureName.split('.');

          if (featureNameSplit.length === 1) {
            Modernizr[featureNameSplit[0]] = result;
          } else {
            // cast to a Boolean, if not one already
            if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
              Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
            }

            Modernizr[featureNameSplit[0]][featureNameSplit[1]] = result;
          }

          classes.push((result ? '' : 'no-') + featureNameSplit.join('-'));
        }
      }
    }
  }
  ;

  /**
   * docElement is a convenience wrapper to grab the root element of the document
   *
   * @access private
   * @returns {HTMLElement|SVGElement} The root element of the document
   */

  var docElement = document.documentElement;
  

  /**
   * A convenience helper to check if the document we are running in is an SVG document
   *
   * @access private
   * @returns {boolean}
   */

  var isSVG = docElement.nodeName.toLowerCase() === 'svg';
  

  /**
   * setClasses takes an array of class names and adds them to the root element
   *
   * @access private
   * @function setClasses
   * @param {string[]} classes - Array of class names
   */

  // Pass in an and array of class names, e.g.:
  //  ['no-webp', 'borderradius', ...]
  function setClasses(classes) {
    var className = docElement.className;
    var classPrefix = Modernizr._config.classPrefix || '';

    if (isSVG) {
      className = className.baseVal;
    }

    // Change `no-js` to `js` (independently of the `enableClasses` option)
    // Handle classPrefix on this too
    if (Modernizr._config.enableJSClass) {
      var reJS = new RegExp('(^|\\s)' + classPrefix + 'no-js(\\s|$)');
      className = className.replace(reJS, '$1' + classPrefix + 'js$2');
    }

    if (Modernizr._config.enableClasses) {
      // Add the new classes
      className += ' ' + classPrefix + classes.join(' ' + classPrefix);
      if (isSVG) {
        docElement.className.baseVal = className;
      } else {
        docElement.className = className;
      }
    }

  }

  ;

  /**
   * hasOwnProp is a shim for hasOwnProperty that is needed for Safari 2.0 support
   *
   * @author kangax
   * @access private
   * @function hasOwnProp
   * @param {object} object - The object to check for a property
   * @param {string} property - The property to check for
   * @returns {boolean}
   */

  // hasOwnProperty shim by kangax needed for Safari 2.0 support
  var hasOwnProp;

  (function() {
    var _hasOwnProperty = ({}).hasOwnProperty;
    /* istanbul ignore else */
    /* we have no way of testing IE 5.5 or safari 2,
     * so just assume the else gets hit */
    if (!is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined')) {
      hasOwnProp = function(object, property) {
        return _hasOwnProperty.call(object, property);
      };
    }
    else {
      hasOwnProp = function(object, property) { /* yes, this can give false positives/negatives, but most of the time we don't care about those */
        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
      };
    }
  })();

  


   // _l tracks listeners for async tests, as well as tests that execute after the initial run
  ModernizrProto._l = {};

  /**
   * Modernizr.on is a way to listen for the completion of async tests. Being
   * asynchronous, they may not finish before your scripts run. As a result you
   * will get a possibly false negative `undefined` value.
   *
   * @memberof Modernizr
   * @name Modernizr.on
   * @access public
   * @function on
   * @param {string} feature - String name of the feature detect
   * @param {function} cb - Callback function returning a Boolean - true if feature is supported, false if not
   * @example
   *
   * ```js
   * Modernizr.on('flash', function( result ) {
   *   if (result) {
   *    // the browser has flash
   *   } else {
   *     // the browser does not have flash
   *   }
   * });
   * ```
   */

  ModernizrProto.on = function(feature, cb) {
    // Create the list of listeners if it doesn't exist
    if (!this._l[feature]) {
      this._l[feature] = [];
    }

    // Push this test on to the listener list
    this._l[feature].push(cb);

    // If it's already been resolved, trigger it on next tick
    if (Modernizr.hasOwnProperty(feature)) {
      // Next Tick
      setTimeout(function() {
        Modernizr._trigger(feature, Modernizr[feature]);
      }, 0);
    }
  };

  /**
   * _trigger is the private function used to signal test completion and run any
   * callbacks registered through [Modernizr.on](#modernizr-on)
   *
   * @memberof Modernizr
   * @name Modernizr._trigger
   * @access private
   * @function _trigger
   * @param {string} feature - string name of the feature detect
   * @param {function|boolean} [res] - A feature detection function, or the boolean =
   * result of a feature detection function
   */

  ModernizrProto._trigger = function(feature, res) {
    if (!this._l[feature]) {
      return;
    }

    var cbs = this._l[feature];

    // Force async
    setTimeout(function() {
      var i, cb;
      for (i = 0; i < cbs.length; i++) {
        cb = cbs[i];
        cb(res);
      }
    }, 0);

    // Don't trigger these again
    delete this._l[feature];
  };

  /**
   * addTest allows you to define your own feature detects that are not currently
   * included in Modernizr (under the covers it's the exact same code Modernizr
   * uses for its own [feature detections](https://github.com/Modernizr/Modernizr/tree/master/feature-detects)). Just like the offical detects, the result
   * will be added onto the Modernizr object, as well as an appropriate className set on
   * the html element when configured to do so
   *
   * @memberof Modernizr
   * @name Modernizr.addTest
   * @optionName Modernizr.addTest()
   * @optionProp addTest
   * @access public
   * @function addTest
   * @param {string|object} feature - The string name of the feature detect, or an
   * object of feature detect names and test
   * @param {function|boolean} test - Function returning true if feature is supported,
   * false if not. Otherwise a boolean representing the results of a feature detection
   * @example
   *
   * The most common way of creating your own feature detects is by calling
   * `Modernizr.addTest` with a string (preferably just lowercase, without any
   * punctuation), and a function you want executed that will return a boolean result
   *
   * ```js
   * Modernizr.addTest('itsTuesday', function() {
   *  var d = new Date();
   *  return d.getDay() === 2;
   * });
   * ```
   *
   * When the above is run, it will set Modernizr.itstuesday to `true` when it is tuesday,
   * and to `false` every other day of the week. One thing to notice is that the names of
   * feature detect functions are always lowercased when added to the Modernizr object. That
   * means that `Modernizr.itsTuesday` will not exist, but `Modernizr.itstuesday` will.
   *
   *
   *  Since we only look at the returned value from any feature detection function,
   *  you do not need to actually use a function. For simple detections, just passing
   *  in a statement that will return a boolean value works just fine.
   *
   * ```js
   * Modernizr.addTest('hasJquery', 'jQuery' in window);
   * ```
   *
   * Just like before, when the above runs `Modernizr.hasjquery` will be true if
   * jQuery has been included on the page. Not using a function saves a small amount
   * of overhead for the browser, as well as making your code much more readable.
   *
   * Finally, you also have the ability to pass in an object of feature names and
   * their tests. This is handy if you want to add multiple detections in one go.
   * The keys should always be a string, and the value can be either a boolean or
   * function that returns a boolean.
   *
   * ```js
   * var detects = {
   *  'hasjquery': 'jQuery' in window,
   *  'itstuesday': function() {
   *    var d = new Date();
   *    return d.getDay() === 2;
   *  }
   * }
   *
   * Modernizr.addTest(detects);
   * ```
   *
   * There is really no difference between the first methods and this one, it is
   * just a convenience to let you write more readable code.
   */

  function addTest(feature, test) {

    if (typeof feature == 'object') {
      for (var key in feature) {
        if (hasOwnProp(feature, key)) {
          addTest(key, feature[ key ]);
        }
      }
    } else {

      feature = feature.toLowerCase();
      var featureNameSplit = feature.split('.');
      var last = Modernizr[featureNameSplit[0]];

      // Again, we don't check for parent test existence. Get that right, though.
      if (featureNameSplit.length == 2) {
        last = last[featureNameSplit[1]];
      }

      if (typeof last != 'undefined') {
        // we're going to quit if you're trying to overwrite an existing test
        // if we were to allow it, we'd do this:
        //   var re = new RegExp("\\b(no-)?" + feature + "\\b");
        //   docElement.className = docElement.className.replace( re, '' );
        // but, no rly, stuff 'em.
        return Modernizr;
      }

      test = typeof test == 'function' ? test() : test;

      // Set the value (this is the magic, right here).
      if (featureNameSplit.length == 1) {
        Modernizr[featureNameSplit[0]] = test;
      } else {
        // cast to a Boolean, if not one already
        if (Modernizr[featureNameSplit[0]] && !(Modernizr[featureNameSplit[0]] instanceof Boolean)) {
          Modernizr[featureNameSplit[0]] = new Boolean(Modernizr[featureNameSplit[0]]);
        }

        Modernizr[featureNameSplit[0]][featureNameSplit[1]] = test;
      }

      // Set a single class (either `feature` or `no-feature`)
      setClasses([(!!test && test != false ? '' : 'no-') + featureNameSplit.join('-')]);

      // Trigger the event
      Modernizr._trigger(feature, test);
    }

    return Modernizr; // allow chaining.
  }

  // After all the tests are run, add self to the Modernizr prototype
  Modernizr._q.push(function() {
    ModernizrProto.addTest = addTest;
  });

  


  /**
   * createElement is a convenience wrapper around document.createElement. Since we
   * use createElement all over the place, this allows for (slightly) smaller code
   * as well as abstracting away issues with creating elements in contexts other than
   * HTML documents (e.g. SVG documents).
   *
   * @access private
   * @function createElement
   * @returns {HTMLElement|SVGElement} An HTML or SVG element
   */

  function createElement() {
    if (typeof document.createElement !== 'function') {
      // This is the case in IE7, where the type of createElement is "object".
      // For this reason, we cannot call apply() as Object is not a Function.
      return document.createElement(arguments[0]);
    } else if (isSVG) {
      return document.createElementNS.call(document, 'http://www.w3.org/2000/svg', arguments[0]);
    } else {
      return document.createElement.apply(document, arguments);
    }
  }

  ;

  /**
   * getBody returns the body of a document, or an element that can stand in for
   * the body if a real body does not exist
   *
   * @access private
   * @function getBody
   * @returns {HTMLElement|SVGElement} Returns the real body of a document, or an
   * artificially created element that stands in for the body
   */

  function getBody() {
    // After page load injecting a fake body doesn't work so check if body exists
    var body = document.body;

    if (!body) {
      // Can't use the real body create a fake one.
      body = createElement(isSVG ? 'svg' : 'body');
      body.fake = true;
    }

    return body;
  }

  ;

  /**
   * injectElementWithStyles injects an element with style element and some CSS rules
   *
   * @access private
   * @function injectElementWithStyles
   * @param {string} rule - String representing a css rule
   * @param {function} callback - A function that is used to test the injected element
   * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
   * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
   * @returns {boolean}
   */

  function injectElementWithStyles(rule, callback, nodes, testnames) {
    var mod = 'modernizr';
    var style;
    var ret;
    var node;
    var docOverflow;
    var div = createElement('div');
    var body = getBody();

    if (parseInt(nodes, 10)) {
      // In order not to give false positives we create a node for each test
      // This also allows the method to scale for unspecified uses
      while (nodes--) {
        node = createElement('div');
        node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
        div.appendChild(node);
      }
    }

    style = createElement('style');
    style.type = 'text/css';
    style.id = 's' + mod;

    // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
    // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
    (!body.fake ? div : body).appendChild(style);
    body.appendChild(div);

    if (style.styleSheet) {
      style.styleSheet.cssText = rule;
    } else {
      style.appendChild(document.createTextNode(rule));
    }
    div.id = mod;

    if (body.fake) {
      //avoid crashing IE8, if background image is used
      body.style.background = '';
      //Safari 5.13/5.1.4 OSX stops loading if ::-webkit-scrollbar is used and scrollbars are visible
      body.style.overflow = 'hidden';
      docOverflow = docElement.style.overflow;
      docElement.style.overflow = 'hidden';
      docElement.appendChild(body);
    }

    ret = callback(div, rule);
    // If this is done after page load we don't want to remove the body so check if body exists
    if (body.fake) {
      body.parentNode.removeChild(body);
      docElement.style.overflow = docOverflow;
      // Trigger layout so kinetic scrolling isn't disabled in iOS6+
      // eslint-disable-next-line
      docElement.offsetHeight;
    } else {
      div.parentNode.removeChild(div);
    }

    return !!ret;

  }

  ;

  /**
   * Modernizr.mq tests a given media query, live against the current state of the window
   * adapted from matchMedia polyfill by Scott Jehl and Paul Irish
   * gist.github.com/786768
   *
   * @memberof Modernizr
   * @name Modernizr.mq
   * @optionName Modernizr.mq()
   * @optionProp mq
   * @access public
   * @function mq
   * @param {string} mq - String of the media query we want to test
   * @returns {boolean}
   * @example
   * Modernizr.mq allows for you to programmatically check if the current browser
   * window state matches a media query.
   *
   * ```js
   *  var query = Modernizr.mq('(min-width: 900px)');
   *
   *  if (query) {
   *    // the browser window is larger than 900px
   *  }
   * ```
   *
   * Only valid media queries are supported, therefore you must always include values
   * with your media query
   *
   * ```js
   * // good
   *  Modernizr.mq('(min-width: 900px)');
   *
   * // bad
   *  Modernizr.mq('min-width');
   * ```
   *
   * If you would just like to test that media queries are supported in general, use
   *
   * ```js
   *  Modernizr.mq('only all'); // true if MQ are supported, false if not
   * ```
   *
   *
   * Note that if the browser does not support media queries (e.g. old IE) mq will
   * always return false.
   */

  var mq = (function() {
    var matchMedia = window.matchMedia || window.msMatchMedia;
    if (matchMedia) {
      return function(mq) {
        var mql = matchMedia(mq);
        return mql && mql.matches || false;
      };
    }

    return function(mq) {
      var bool = false;

      injectElementWithStyles('@media ' + mq + ' { #modernizr { position: absolute; } }', function(node) {
        bool = (window.getComputedStyle ?
                window.getComputedStyle(node, null) :
                node.currentStyle).position == 'absolute';
      });

      return bool;
    };
  })();


  ModernizrProto.mq = mq;

  

/**
  * @optionName html5printshiv
  * @optionProp html5printshiv
  */

  // Take the html5 variable out of the html5shiv scope so we can return it.
  var html5;
  if (!isSVG) {

    /**
     * @preserve HTML5 Shiv 3.7.3 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
     */
    ;(function(window, document) {
      /** version */
      var version = '3.7.3';

      /** Preset options */
      var options = window.html5 || {};

      /** Used to skip problem elements */
      var reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i;

      /** Not all elements can be cloned in IE **/
      var saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i;

      /** Detect whether the browser supports default html5 styles */
      var supportsHtml5Styles;

      /** Name of the expando, to work with multiple documents or to re-shiv one document */
      var expando = '_html5shiv';

      /** The id for the the documents expando */
      var expanID = 0;

      /** Cached data for each document */
      var expandoData = {};

      /** Detect whether the browser supports unknown elements */
      var supportsUnknownElements;

      (function() {
        try {
          var a = document.createElement('a');
          a.innerHTML = '<xyz></xyz>';
          //if the hidden property is implemented we can assume, that the browser supports basic HTML5 Styles
          supportsHtml5Styles = ('hidden' in a);

          supportsUnknownElements = a.childNodes.length == 1 || (function() {
            // assign a false positive if unable to shiv
            (document.createElement)('a');
            var frag = document.createDocumentFragment();
            return (
              typeof frag.cloneNode == 'undefined' ||
                typeof frag.createDocumentFragment == 'undefined' ||
                typeof frag.createElement == 'undefined'
            );
          }());
        } catch(e) {
          // assign a false positive if detection fails => unable to shiv
          supportsHtml5Styles = true;
          supportsUnknownElements = true;
        }

      }());

      /*--------------------------------------------------------------------------*/

      /**
       * Creates a style sheet with the given CSS text and adds it to the document.
       * @private
       * @param {Document} ownerDocument The document.
       * @param {String} cssText The CSS text.
       * @returns {StyleSheet} The style element.
       */
      function addStyleSheet(ownerDocument, cssText) {
        var p = ownerDocument.createElement('p'),
          parent = ownerDocument.getElementsByTagName('head')[0] || ownerDocument.documentElement;

        p.innerHTML = 'x<style>' + cssText + '</style>';
        return parent.insertBefore(p.lastChild, parent.firstChild);
      }

      /**
       * Returns the value of `html5.elements` as an array.
       * @private
       * @returns {Array} An array of shived element node names.
       */
      function getElements() {
        var elements = html5.elements;
        return typeof elements == 'string' ? elements.split(' ') : elements;
      }

      /**
       * Extends the built-in list of html5 elements
       * @memberOf html5
       * @param {String|Array} newElements whitespace separated list or array of new element names to shiv
       * @param {Document} ownerDocument The context document.
       */
      function addElements(newElements, ownerDocument) {
        var elements = html5.elements;
        if(typeof elements != 'string'){
          elements = elements.join(' ');
        }
        if(typeof newElements != 'string'){
          newElements = newElements.join(' ');
        }
        html5.elements = elements +' '+ newElements;
        shivDocument(ownerDocument);
      }

      /**
       * Returns the data associated to the given document
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Object} An object of data.
       */
      function getExpandoData(ownerDocument) {
        var data = expandoData[ownerDocument[expando]];
        if (!data) {
          data = {};
          expanID++;
          ownerDocument[expando] = expanID;
          expandoData[expanID] = data;
        }
        return data;
      }

      /**
       * returns a shived element for the given nodeName and document
       * @memberOf html5
       * @param {String} nodeName name of the element
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived element.
       */
      function createElement(nodeName, ownerDocument, data){
        if (!ownerDocument) {
          ownerDocument = document;
        }
        if(supportsUnknownElements){
          return ownerDocument.createElement(nodeName);
        }
        if (!data) {
          data = getExpandoData(ownerDocument);
        }
        var node;

        if (data.cache[nodeName]) {
          node = data.cache[nodeName].cloneNode();
        } else if (saveClones.test(nodeName)) {
          node = (data.cache[nodeName] = data.createElem(nodeName)).cloneNode();
        } else {
          node = data.createElem(nodeName);
        }

        // Avoid adding some elements to fragments in IE < 9 because
        // * Attributes like `name` or `type` cannot be set/changed once an element
        //   is inserted into a document/fragment
        // * Link elements with `src` attributes that are inaccessible, as with
        //   a 403 response, will cause the tab/window to crash
        // * Script elements appended to fragments will execute when their `src`
        //   or `text` property is set
        return node.canHaveChildren && !reSkip.test(nodeName) && !node.tagUrn ? data.frag.appendChild(node) : node;
      }

      /**
       * returns a shived DocumentFragment for the given document
       * @memberOf html5
       * @param {Document} ownerDocument The context document.
       * @returns {Object} The shived DocumentFragment.
       */
      function createDocumentFragment(ownerDocument, data){
        if (!ownerDocument) {
          ownerDocument = document;
        }
        if(supportsUnknownElements){
          return ownerDocument.createDocumentFragment();
        }
        data = data || getExpandoData(ownerDocument);
        var clone = data.frag.cloneNode(),
          i = 0,
          elems = getElements(),
          l = elems.length;
        for(;i<l;i++){
          clone.createElement(elems[i]);
        }
        return clone;
      }

      /**
       * Shivs the `createElement` and `createDocumentFragment` methods of the document.
       * @private
       * @param {Document|DocumentFragment} ownerDocument The document.
       * @param {Object} data of the document.
       */
      function shivMethods(ownerDocument, data) {
        if (!data.cache) {
          data.cache = {};
          data.createElem = ownerDocument.createElement;
          data.createFrag = ownerDocument.createDocumentFragment;
          data.frag = data.createFrag();
        }


        ownerDocument.createElement = function(nodeName) {
          //abort shiv
          if (!html5.shivMethods) {
            return data.createElem(nodeName);
          }
          return createElement(nodeName, ownerDocument, data);
        };

        ownerDocument.createDocumentFragment = Function('h,f', 'return function(){' +
                                                        'var n=f.cloneNode(),c=n.createElement;' +
                                                        'h.shivMethods&&(' +
                                                        // unroll the `createElement` calls
                                                        getElements().join().replace(/[\w\-:]+/g, function(nodeName) {
                                                          data.createElem(nodeName);
                                                          data.frag.createElement(nodeName);
                                                          return 'c("' + nodeName + '")';
                                                        }) +
          ');return n}'
                                                       )(html5, data.frag);
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Shivs the given document.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
      function shivDocument(ownerDocument) {
        if (!ownerDocument) {
          ownerDocument = document;
        }
        var data = getExpandoData(ownerDocument);

        if (html5.shivCSS && !supportsHtml5Styles && !data.hasCSS) {
          data.hasCSS = !!addStyleSheet(ownerDocument,
                                        // corrects block display not defined in IE6/7/8/9
                                        'article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}' +
                                        // adds styling not present in IE6/7/8/9
                                        'mark{background:#FF0;color:#000}' +
                                        // hides non-rendered elements
                                        'template{display:none}'
                                       );
        }
        if (!supportsUnknownElements) {
          shivMethods(ownerDocument, data);
        }
        return ownerDocument;
      }

      /*--------------------------------------------------------------------------*/

      /**
       * The `html5` object is exposed so that more elements can be shived and
       * existing shiving can be detected on iframes.
       * @type Object
       * @example
       *
       * // options can be changed before the script is included
       * html5 = { 'elements': 'mark section', 'shivCSS': false, 'shivMethods': false };
       */
      var html5 = {

        /**
         * An array or space separated string of node names of the elements to shiv.
         * @memberOf html5
         * @type Array|String
         */
        'elements': options.elements || 'abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video',

        /**
         * current version of html5shiv
         */
        'version': version,

        /**
         * A flag to indicate that the HTML5 style sheet should be inserted.
         * @memberOf html5
         * @type Boolean
         */
        'shivCSS': (options.shivCSS !== false),

        /**
         * Is equal to true if a browser supports creating unknown/HTML5 elements
         * @memberOf html5
         * @type boolean
         */
        'supportsUnknownElements': supportsUnknownElements,

        /**
         * A flag to indicate that the document's `createElement` and `createDocumentFragment`
         * methods should be overwritten.
         * @memberOf html5
         * @type Boolean
         */
        'shivMethods': (options.shivMethods !== false),

        /**
         * A string to describe the type of `html5` object ("default" or "default print").
         * @memberOf html5
         * @type String
         */
        'type': 'default',

        // shivs the document according to the specified `html5` object options
        'shivDocument': shivDocument,

        //creates a shived element
        createElement: createElement,

        //creates a shived documentFragment
        createDocumentFragment: createDocumentFragment,

        //extends list of elements
        addElements: addElements
      };

      /*--------------------------------------------------------------------------*/

      // expose html5
      window.html5 = html5;

      // shiv the document
      shivDocument(document);

      /*------------------------------- Print Shiv -------------------------------*/

      /** Used to filter media types */
      var reMedia = /^$|\b(?:all|print)\b/;

      /** Used to namespace printable elements */
      var shivNamespace = 'html5shiv';

      /** Detect whether the browser supports shivable style sheets */
      var supportsShivableSheets = !supportsUnknownElements && (function() {
        // assign a false negative if unable to shiv
        var docEl = document.documentElement;
        return !(
          typeof document.namespaces == 'undefined' ||
            typeof document.parentWindow == 'undefined' ||
            typeof docEl.applyElement == 'undefined' ||
            typeof docEl.removeNode == 'undefined' ||
            typeof window.attachEvent == 'undefined'
        );
      }());

      /*--------------------------------------------------------------------------*/

      /**
       * Wraps all HTML5 elements in the given document with printable elements.
       * (eg. the "header" element is wrapped with the "html5shiv:header" element)
       * @private
       * @param {Document} ownerDocument The document.
       * @returns {Array} An array wrappers added.
       */
      function addWrappers(ownerDocument) {
        var node,
          nodes = ownerDocument.getElementsByTagName('*'),
          index = nodes.length,
          reElements = RegExp('^(?:' + getElements().join('|') + ')$', 'i'),
          result = [];

        while (index--) {
          node = nodes[index];
          if (reElements.test(node.nodeName)) {
            result.push(node.applyElement(createWrapper(node)));
          }
        }
        return result;
      }

      /**
       * Creates a printable wrapper for the given element.
       * @private
       * @param {Element} element The element.
       * @returns {Element} The wrapper.
       */
      function createWrapper(element) {
        var node,
          nodes = element.attributes,
          index = nodes.length,
          wrapper = element.ownerDocument.createElement(shivNamespace + ':' + element.nodeName);

        // copy element attributes to the wrapper
        while (index--) {
          node = nodes[index];
          node.specified && wrapper.setAttribute(node.nodeName, node.nodeValue);
        }
        // copy element styles to the wrapper
        wrapper.style.cssText = element.style.cssText;
        return wrapper;
      }

      /**
       * Shivs the given CSS text.
       * (eg. header{} becomes html5shiv\:header{})
       * @private
       * @param {String} cssText The CSS text to shiv.
       * @returns {String} The shived CSS text.
       */
      function shivCssText(cssText) {
        var pair,
          parts = cssText.split('{'),
          index = parts.length,
          reElements = RegExp('(^|[\\s,>+~])(' + getElements().join('|') + ')(?=[[\\s,>+~#.:]|$)', 'gi'),
          replacement = '$1' + shivNamespace + '\\:$2';

        while (index--) {
          pair = parts[index] = parts[index].split('}');
          pair[pair.length - 1] = pair[pair.length - 1].replace(reElements, replacement);
          parts[index] = pair.join('}');
        }
        return parts.join('{');
      }

      /**
       * Removes the given wrappers, leaving the original elements.
       * @private
       * @params {Array} wrappers An array of printable wrappers.
       */
      function removeWrappers(wrappers) {
        var index = wrappers.length;
        while (index--) {
          wrappers[index].removeNode();
        }
      }

      /*--------------------------------------------------------------------------*/

      /**
       * Shivs the given document for print.
       * @memberOf html5
       * @param {Document} ownerDocument The document to shiv.
       * @returns {Document} The shived document.
       */
      function shivPrint(ownerDocument) {
        var shivedSheet,
          wrappers,
          data = getExpandoData(ownerDocument),
          namespaces = ownerDocument.namespaces,
          ownerWindow = ownerDocument.parentWindow;

        if (!supportsShivableSheets || ownerDocument.printShived) {
          return ownerDocument;
        }
        if (typeof namespaces[shivNamespace] == 'undefined') {
          namespaces.add(shivNamespace);
        }

        function removeSheet() {
          clearTimeout(data._removeSheetTimer);
          if (shivedSheet) {
            shivedSheet.removeNode(true);
          }
          shivedSheet= null;
        }

        ownerWindow.attachEvent('onbeforeprint', function() {

          removeSheet();

          var imports,
            length,
            sheet,
            collection = ownerDocument.styleSheets,
            cssText = [],
            index = collection.length,
            sheets = Array(index);

          // convert styleSheets collection to an array
          while (index--) {
            sheets[index] = collection[index];
          }
          // concat all style sheet CSS text
          while ((sheet = sheets.pop())) {
            // IE does not enforce a same origin policy for external style sheets...
            // but has trouble with some dynamically created stylesheets
            if (!sheet.disabled && reMedia.test(sheet.media)) {

              try {
                imports = sheet.imports;
                length = imports.length;
              } catch(er){
                length = 0;
              }

              for (index = 0; index < length; index++) {
                sheets.push(imports[index]);
              }

              try {
                cssText.push(sheet.cssText);
              } catch(er){}
            }
          }

          // wrap all HTML5 elements with printable elements and add the shived style sheet
          cssText = shivCssText(cssText.reverse().join(''));
          wrappers = addWrappers(ownerDocument);
          shivedSheet = addStyleSheet(ownerDocument, cssText);

        });

        ownerWindow.attachEvent('onafterprint', function() {
          // remove wrappers, leaving the original elements, and remove the shived style sheet
          removeWrappers(wrappers);
          clearTimeout(data._removeSheetTimer);
          data._removeSheetTimer = setTimeout(removeSheet, 500);
        });

        ownerDocument.printShived = true;
        return ownerDocument;
      }

      /*--------------------------------------------------------------------------*/

      // expose API
      html5.type += ' print';
      html5.shivPrint = shivPrint;

      // shiv for print
      shivPrint(document);

      if(typeof module == 'object' && module.exports){
        module.exports = html5;
      }

    }(typeof window !== 'undefined' ? window : this, document));
  }

  ;


  /**
   * contains checks to see if a string contains another string
   *
   * @access private
   * @function contains
   * @param {string} str - The string we want to check for substrings
   * @param {string} substr - The substring we want to search the first string for
   * @returns {boolean}
   */

  function contains(str, substr) {
    return !!~('' + str).indexOf(substr);
  }

  ;

  /**
   * Create our "modernizr" element that we do most feature tests on.
   *
   * @access private
   */

  var modElem = {
    elem: createElement('modernizr')
  };

  // Clean up this element
  Modernizr._q.push(function() {
    delete modElem.elem;
  });

  

  var mStyle = {
    style: modElem.elem.style
  };

  // kill ref for gc, must happen before mod.elem is removed, so we unshift on to
  // the front of the queue.
  Modernizr._q.unshift(function() {
    delete mStyle.style;
  });

  

  /**
   * domToCSS takes a camelCase string and converts it to kebab-case
   * e.g. boxSizing -> box-sizing
   *
   * @access private
   * @function domToCSS
   * @param {string} name - String name of camelCase prop we want to convert
   * @returns {string} The kebab-case version of the supplied name
   */

  function domToCSS(name) {
    return name.replace(/([A-Z])/g, function(str, m1) {
      return '-' + m1.toLowerCase();
    }).replace(/^ms-/, '-ms-');
  }
  ;


  /**
   * wrapper around getComputedStyle, to fix issues with Firefox returning null when
   * called inside of a hidden iframe
   *
   * @access private
   * @function computedStyle
   * @param {HTMLElement|SVGElement} - The element we want to find the computed styles of
   * @param {string|null} [pseudoSelector]- An optional pseudo element selector (e.g. :before), of null if none
   * @returns {CSSStyleDeclaration}
   */

  function computedStyle(elem, pseudo, prop) {
    var result;

    if ('getComputedStyle' in window) {
      result = getComputedStyle.call(window, elem, pseudo);
      var console = window.console;

      if (result !== null) {
        if (prop) {
          result = result.getPropertyValue(prop);
        }
      } else {
        if (console) {
          var method = console.error ? 'error' : 'log';
          console[method].call(console, 'getComputedStyle returning null, its possible modernizr test results are inaccurate');
        }
      }
    } else {
      result = !pseudo && elem.currentStyle && elem.currentStyle[prop];
    }

    return result;
  }

  ;

  /**
   * nativeTestProps allows for us to use native feature detection functionality if available.
   * some prefixed form, or false, in the case of an unsupported rule
   *
   * @access private
   * @function nativeTestProps
   * @param {array} props - An array of property names
   * @param {string} value - A string representing the value we want to check via @supports
   * @returns {boolean|undefined} A boolean when @supports exists, undefined otherwise
   */

  // Accepts a list of property names and a single value
  // Returns `undefined` if native detection not available
  function nativeTestProps(props, value) {
    var i = props.length;
    // Start with the JS API: http://www.w3.org/TR/css3-conditional/#the-css-interface
    if ('CSS' in window && 'supports' in window.CSS) {
      // Try every prefixed variant of the property
      while (i--) {
        if (window.CSS.supports(domToCSS(props[i]), value)) {
          return true;
        }
      }
      return false;
    }
    // Otherwise fall back to at-rule (for Opera 12.x)
    else if ('CSSSupportsRule' in window) {
      // Build a condition string for every prefixed variant
      var conditionText = [];
      while (i--) {
        conditionText.push('(' + domToCSS(props[i]) + ':' + value + ')');
      }
      conditionText = conditionText.join(' or ');
      return injectElementWithStyles('@supports (' + conditionText + ') { #modernizr { position: absolute; } }', function(node) {
        return computedStyle(node, null, 'position') == 'absolute';
      });
    }
    return undefined;
  }
  ;

  /**
   * cssToDOM takes a kebab-case string and converts it to camelCase
   * e.g. box-sizing -> boxSizing
   *
   * @access private
   * @function cssToDOM
   * @param {string} name - String name of kebab-case prop we want to convert
   * @returns {string} The camelCase version of the supplied name
   */

  function cssToDOM(name) {
    return name.replace(/([a-z])-([a-z])/g, function(str, m1, m2) {
      return m1 + m2.toUpperCase();
    }).replace(/^-/, '');
  }
  ;

  // testProps is a generic CSS / DOM property test.

  // In testing support for a given CSS property, it's legit to test:
  //    `elem.style[styleName] !== undefined`
  // If the property is supported it will return an empty string,
  // if unsupported it will return undefined.

  // We'll take advantage of this quick test and skip setting a style
  // on our modernizr element, but instead just testing undefined vs
  // empty string.

  // Property names can be provided in either camelCase or kebab-case.

  function testProps(props, prefixed, value, skipValueTest) {
    skipValueTest = is(skipValueTest, 'undefined') ? false : skipValueTest;

    // Try native detect first
    if (!is(value, 'undefined')) {
      var result = nativeTestProps(props, value);
      if (!is(result, 'undefined')) {
        return result;
      }
    }

    // Otherwise do it properly
    var afterInit, i, propsLength, prop, before;

    // If we don't have a style element, that means we're running async or after
    // the core tests, so we'll need to create our own elements to use

    // inside of an SVG element, in certain browsers, the `style` element is only
    // defined for valid tags. Therefore, if `modernizr` does not have one, we
    // fall back to a less used element and hope for the best.
    // for strict XHTML browsers the hardly used samp element is used
    var elems = ['modernizr', 'tspan', 'samp'];
    while (!mStyle.style && elems.length) {
      afterInit = true;
      mStyle.modElem = createElement(elems.shift());
      mStyle.style = mStyle.modElem.style;
    }

    // Delete the objects if we created them.
    function cleanElems() {
      if (afterInit) {
        delete mStyle.style;
        delete mStyle.modElem;
      }
    }

    propsLength = props.length;
    for (i = 0; i < propsLength; i++) {
      prop = props[i];
      before = mStyle.style[prop];

      if (contains(prop, '-')) {
        prop = cssToDOM(prop);
      }

      if (mStyle.style[prop] !== undefined) {

        // If value to test has been passed in, do a set-and-check test.
        // 0 (integer) is a valid property value, so check that `value` isn't
        // undefined, rather than just checking it's truthy.
        if (!skipValueTest && !is(value, 'undefined')) {

          // Needs a try catch block because of old IE. This is slow, but will
          // be avoided in most cases because `skipValueTest` will be used.
          try {
            mStyle.style[prop] = value;
          } catch (e) {}

          // If the property value has changed, we assume the value used is
          // supported. If `value` is empty string, it'll fail here (because
          // it hasn't changed), which matches how browsers have implemented
          // CSS.supports()
          if (mStyle.style[prop] != before) {
            cleanElems();
            return prefixed == 'pfx' ? prop : true;
          }
        }
        // Otherwise just return true, or the property name if this is a
        // `prefixed()` call
        else {
          cleanElems();
          return prefixed == 'pfx' ? prop : true;
        }
      }
    }
    cleanElems();
    return false;
  }

  ;

  /**
   * testProp() investigates whether a given style property is recognized
   * Property names can be provided in either camelCase or kebab-case.
   *
   * @memberof Modernizr
   * @name Modernizr.testProp
   * @access public
   * @optionName Modernizr.testProp()
   * @optionProp testProp
   * @function testProp
   * @param {string} prop - Name of the CSS property to check
   * @param {string} [value] - Name of the CSS value to check
   * @param {boolean} [useValue] - Whether or not to check the value if @supports isn't supported
   * @returns {boolean}
   * @example
   *
   * Just like [testAllProps](#modernizr-testallprops), only it does not check any vendor prefixed
   * version of the string.
   *
   * Note that the property name must be provided in camelCase (e.g. boxSizing not box-sizing)
   *
   * ```js
   * Modernizr.testProp('pointerEvents')  // true
   * ```
   *
   * You can also provide a value as an optional second argument to check if a
   * specific value is supported
   *
   * ```js
   * Modernizr.testProp('pointerEvents', 'none') // true
   * Modernizr.testProp('pointerEvents', 'penguin') // false
   * ```
   */

  var testProp = ModernizrProto.testProp = function(prop, value, useValue) {
    return testProps([prop], undefined, value, useValue);
  };
  

  /**
   * fnBind is a super small [bind](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind) polyfill.
   *
   * @access private
   * @function fnBind
   * @param {function} fn - a function you want to change `this` reference to
   * @param {object} that - the `this` you want to call the function with
   * @returns {function} The wrapped version of the supplied function
   */

  function fnBind(fn, that) {
    return function() {
      return fn.apply(that, arguments);
    };
  }

  ;

  /**
   * List of property values to set for css tests. See ticket #21
   * http://git.io/vUGl4
   *
   * @memberof Modernizr
   * @name Modernizr._prefixes
   * @optionName Modernizr._prefixes
   * @optionProp prefixes
   * @access public
   * @example
   *
   * Modernizr._prefixes is the internal list of prefixes that we test against
   * inside of things like [prefixed](#modernizr-prefixed) and [prefixedCSS](#-code-modernizr-prefixedcss). It is simply
   * an array of kebab-case vendor prefixes you can use within your code.
   *
   * Some common use cases include
   *
   * Generating all possible prefixed version of a CSS property
   * ```js
   * var rule = Modernizr._prefixes.join('transform: rotate(20deg); ');
   *
   * rule === 'transform: rotate(20deg); webkit-transform: rotate(20deg); moz-transform: rotate(20deg); o-transform: rotate(20deg); ms-transform: rotate(20deg);'
   * ```
   *
   * Generating all possible prefixed version of a CSS value
   * ```js
   * rule = 'display:' +  Modernizr._prefixes.join('flex; display:') + 'flex';
   *
   * rule === 'display:flex; display:-webkit-flex; display:-moz-flex; display:-o-flex; display:-ms-flex; display:flex'
   * ```
   */

  // we use ['',''] rather than an empty array in order to allow a pattern of .`join()`ing prefixes to test
  // values in feature detects to continue to work
  var prefixes = (ModernizrProto._config.usePrefixes ? ' -webkit- -moz- -o- -ms- '.split(' ') : ['','']);

  // expose these for the plugin API. Look in the source for how to join() them against your input
  ModernizrProto._prefixes = prefixes;

  

  /**
   * testStyles injects an element with style element and some CSS rules
   *
   * @memberof Modernizr
   * @name Modernizr.testStyles
   * @optionName Modernizr.testStyles()
   * @optionProp testStyles
   * @access public
   * @function testStyles
   * @param {string} rule - String representing a css rule
   * @param {function} callback - A function that is used to test the injected element
   * @param {number} [nodes] - An integer representing the number of additional nodes you want injected
   * @param {string[]} [testnames] - An array of strings that are used as ids for the additional nodes
   * @returns {boolean}
   * @example
   *
   * `Modernizr.testStyles` takes a CSS rule and injects it onto the current page
   * along with (possibly multiple) DOM elements. This lets you check for features
   * that can not be detected by simply checking the [IDL](https://developer.mozilla.org/en-US/docs/Mozilla/Developer_guide/Interface_development_guide/IDL_interface_rules).
   *
   * ```js
   * Modernizr.testStyles('#modernizr { width: 9px; color: papayawhip; }', function(elem, rule) {
   *   // elem is the first DOM node in the page (by default #modernizr)
   *   // rule is the first argument you supplied - the CSS rule in string form
   *
   *   addTest('widthworks', elem.style.width === '9px')
   * });
   * ```
   *
   * If your test requires multiple nodes, you can include a third argument
   * indicating how many additional div elements to include on the page. The
   * additional nodes are injected as children of the `elem` that is returned as
   * the first argument to the callback.
   *
   * ```js
   * Modernizr.testStyles('#modernizr {width: 1px}; #modernizr2 {width: 2px}', function(elem) {
   *   document.getElementById('modernizr').style.width === '1px'; // true
   *   document.getElementById('modernizr2').style.width === '2px'; // true
   *   elem.firstChild === document.getElementById('modernizr2'); // true
   * }, 1);
   * ```
   *
   * By default, all of the additional elements have an ID of `modernizr[n]`, where
   * `n` is its index (e.g. the first additional, second overall is `#modernizr2`,
   * the second additional is `#modernizr3`, etc.).
   * If you want to have more meaningful IDs for your function, you can provide
   * them as the fourth argument, as an array of strings
   *
   * ```js
   * Modernizr.testStyles('#foo {width: 10px}; #bar {height: 20px}', function(elem) {
   *   elem.firstChild === document.getElementById('foo'); // true
   *   elem.lastChild === document.getElementById('bar'); // true
   * }, 2, ['foo', 'bar']);
   * ```
   *
   */

  var testStyles = ModernizrProto.testStyles = injectElementWithStyles;
  
/*!
{
  "name": "Touch Events",
  "property": "touchevents",
  "caniuse" : "touch",
  "tags": ["media", "attribute"],
  "notes": [{
    "name": "Touch Events spec",
    "href": "https://www.w3.org/TR/2013/WD-touch-events-20130124/"
  }],
  "warnings": [
    "Indicates if the browser supports the Touch Events spec, and does not necessarily reflect a touchscreen device"
  ],
  "knownBugs": [
    "False-positive on some configurations of Nokia N900",
    "False-positive on some BlackBerry 6.0 builds – https://github.com/Modernizr/Modernizr/issues/372#issuecomment-3112695"
  ]
}
!*/
/* DOC
Indicates if the browser supports the W3C Touch Events API.

This *does not* necessarily reflect a touchscreen device:

* Older touchscreen devices only emulate mouse events
* Modern IE touch devices implement the Pointer Events API instead: use `Modernizr.pointerevents` to detect support for that
* Some browsers & OS setups may enable touch APIs when no touchscreen is connected
* Future browsers may implement other event models for touch interactions

See this article: [You Can't Detect A Touchscreen](http://www.stucox.com/blog/you-cant-detect-a-touchscreen/).

It's recommended to bind both mouse and touch/pointer events simultaneously – see [this HTML5 Rocks tutorial](http://www.html5rocks.com/en/mobile/touchandmouse/).

This test will also return `true` for Firefox 4 Multitouch support.
*/

  // Chrome (desktop) used to lie about its support on this, but that has since been rectified: http://crbug.com/36415
  Modernizr.addTest('touchevents', function() {
    var bool;
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
      bool = true;
    } else {
      // include the 'heartz' as a way to have a non matching MQ to help terminate the join
      // https://git.io/vznFH
      var query = ['@media (', prefixes.join('touch-enabled),('), 'heartz', ')', '{#modernizr{top:9px;position:absolute}}'].join('');
      testStyles(query, function(node) {
        bool = node.offsetTop === 9;
      });
    }
    return bool;
  });

/*!
{
  "name": "SVG as an <img> tag source",
  "property": "svgasimg",
  "caniuse" : "svg-img",
  "tags": ["svg"],
  "aliases": ["svgincss"],
  "authors": ["Chris Coyier"],
  "notes": [{
    "name": "HTML5 Spec",
    "href": "http://www.w3.org/TR/html5/embedded-content-0.html#the-img-element"
  }]
}
!*/


  // Original Async test by Stu Cox
  // https://gist.github.com/chriscoyier/8774501

  // Now a Sync test based on good results here
  // http://codepen.io/chriscoyier/pen/bADFx

  // Note http://www.w3.org/TR/SVG11/feature#Image is *supposed* to represent
  // support for the `<image>` tag in SVG, not an SVG file linked from an `<img>`
  // tag in HTML – but it’s a heuristic which works
  Modernizr.addTest('svgasimg', document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1'));

/*!
{
  "name": "placeholder attribute",
  "property": "placeholder",
  "tags": ["forms", "attribute"],
  "builderAliases": ["forms_placeholder"]
}
!*/
/* DOC
Tests for placeholder attribute in inputs and textareas
*/

  Modernizr.addTest('placeholder', ('placeholder' in createElement('input') && 'placeholder' in createElement('textarea')));


  /**
   * If the browsers follow the spec, then they would expose vendor-specific styles as:
   *   elem.style.WebkitBorderRadius
   * instead of something like the following (which is technically incorrect):
   *   elem.style.webkitBorderRadius

   * WebKit ghosts their properties in lowercase but Opera & Moz do not.
   * Microsoft uses a lowercase `ms` instead of the correct `Ms` in IE8+
   *   erik.eae.net/archives/2008/03/10/21.48.10/

   * More here: github.com/Modernizr/Modernizr/issues/issue/21
   *
   * @access private
   * @returns {string} The string representing the vendor-specific style properties
   */

  var omPrefixes = 'Moz O ms Webkit';
  

  var cssomPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.split(' ') : []);
  ModernizrProto._cssomPrefixes = cssomPrefixes;
  

  /**
   * List of JavaScript DOM values used for tests
   *
   * @memberof Modernizr
   * @name Modernizr._domPrefixes
   * @optionName Modernizr._domPrefixes
   * @optionProp domPrefixes
   * @access public
   * @example
   *
   * Modernizr._domPrefixes is exactly the same as [_prefixes](#modernizr-_prefixes), but rather
   * than kebab-case properties, all properties are their Capitalized variant
   *
   * ```js
   * Modernizr._domPrefixes === [ "Moz", "O", "ms", "Webkit" ];
   * ```
   */

  var domPrefixes = (ModernizrProto._config.usePrefixes ? omPrefixes.toLowerCase().split(' ') : []);
  ModernizrProto._domPrefixes = domPrefixes;
  

  /**
   * testDOMProps is a generic DOM property test; if a browser supports
   *   a certain property, it won't return undefined for it.
   *
   * @access private
   * @function testDOMProps
   * @param {array.<string>} props - An array of properties to test for
   * @param {object} obj - An object or Element you want to use to test the parameters again
   * @param {boolean|object} elem - An Element to bind the property lookup again. Use `false` to prevent the check
   * @returns {false|*} returns false if the prop is unsupported, otherwise the value that is supported
   */
  function testDOMProps(props, obj, elem) {
    var item;

    for (var i in props) {
      if (props[i] in obj) {

        // return the property name as a string
        if (elem === false) {
          return props[i];
        }

        item = obj[props[i]];

        // let's bind a function
        if (is(item, 'function')) {
          // bind to obj unless overriden
          return fnBind(item, elem || obj);
        }

        // return the unbound function or obj or value
        return item;
      }
    }
    return false;
  }

  ;

  /**
   * testPropsAll tests a list of DOM properties we want to check against.
   * We specify literally ALL possible (known and/or likely) properties on
   * the element including the non-vendor prefixed one, for forward-
   * compatibility.
   *
   * @access private
   * @function testPropsAll
   * @param {string} prop - A string of the property to test for
   * @param {string|object} [prefixed] - An object to check the prefixed properties on. Use a string to skip
   * @param {HTMLElement|SVGElement} [elem] - An element used to test the property and value against
   * @param {string} [value] - A string of a css value
   * @param {boolean} [skipValueTest] - An boolean representing if you want to test if value sticks when set
   * @returns {false|string} returns the string version of the property, or false if it is unsupported
   */
  function testPropsAll(prop, prefixed, elem, value, skipValueTest) {

    var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1),
      props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

    // did they call .prefixed('boxSizing') or are we just testing a prop?
    if (is(prefixed, 'string') || is(prefixed, 'undefined')) {
      return testProps(props, prefixed, value, skipValueTest);

      // otherwise, they called .prefixed('requestAnimationFrame', window[, elem])
    } else {
      props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
      return testDOMProps(props, prefixed, elem);
    }
  }

  // Modernizr.testAllProps() investigates whether a given style property,
  // or any of its vendor-prefixed variants, is recognized
  //
  // Note that the property names must be provided in the camelCase variant.
  // Modernizr.testAllProps('boxSizing')
  ModernizrProto.testAllProps = testPropsAll;

  

  /**
   * testAllProps determines whether a given CSS property is supported in the browser
   *
   * @memberof Modernizr
   * @name Modernizr.testAllProps
   * @optionName Modernizr.testAllProps()
   * @optionProp testAllProps
   * @access public
   * @function testAllProps
   * @param {string} prop - String naming the property to test (either camelCase or kebab-case)
   * @param {string} [value] - String of the value to test
   * @param {boolean} [skipValueTest=false] - Whether to skip testing that the value is supported when using non-native detection
   * @example
   *
   * testAllProps determines whether a given CSS property, in some prefixed form,
   * is supported by the browser.
   *
   * ```js
   * testAllProps('boxSizing')  // true
   * ```
   *
   * It can optionally be given a CSS value in string form to test if a property
   * value is valid
   *
   * ```js
   * testAllProps('display', 'block') // true
   * testAllProps('display', 'penguin') // false
   * ```
   *
   * A boolean can be passed as a third parameter to skip the value check when
   * native detection (@supports) isn't available.
   *
   * ```js
   * testAllProps('shapeOutside', 'content-box', true);
   * ```
   */

  function testAllProps(prop, value, skipValueTest) {
    return testPropsAll(prop, undefined, undefined, value, skipValueTest);
  }
  ModernizrProto.testAllProps = testAllProps;
  
/*!
{
  "name": "CSS Transitions",
  "property": "csstransitions",
  "caniuse": "css-transitions",
  "tags": ["css"]
}
!*/

  Modernizr.addTest('csstransitions', testAllProps('transition', 'all', true));

/*!
{
  "name": "CSS Transforms",
  "property": "csstransforms",
  "caniuse": "transforms2d",
  "tags": ["css"]
}
!*/

  Modernizr.addTest('csstransforms', function() {
    // Android < 3.0 is buggy, so we sniff and blacklist
    // http://git.io/hHzL7w
    return navigator.userAgent.indexOf('Android 2.') === -1 &&
           testAllProps('transform', 'scale(1)', true);
  });


  /**
   * Modernizr.hasEvent() detects support for a given event
   *
   * @memberof Modernizr
   * @name Modernizr.hasEvent
   * @optionName Modernizr.hasEvent()
   * @optionProp hasEvent
   * @access public
   * @function hasEvent
   * @param  {string|*} eventName - the name of an event to test for (e.g. "resize")
   * @param  {Element|string} [element=HTMLDivElement] - is the element|document|window|tagName to test on
   * @returns {boolean}
   * @example
   *  `Modernizr.hasEvent` lets you determine if the browser supports a supplied event.
   *  By default, it does this detection on a div element
   *
   * ```js
   *  hasEvent('blur') // true;
   * ```
   *
   * However, you are able to give an object as a second argument to hasEvent to
   * detect an event on something other than a div.
   *
   * ```js
   *  hasEvent('devicelight', window) // true;
   * ```
   *
   */

  var hasEvent = (function() {

    // Detect whether event support can be detected via `in`. Test on a DOM element
    // using the "blur" event b/c it should always exist. bit.ly/event-detection
    var needsFallback = !('onblur' in document.documentElement);

    function inner(eventName, element) {

      var isSupported;
      if (!eventName) { return false; }
      if (!element || typeof element === 'string') {
        element = createElement(element || 'div');
      }

      // Testing via the `in` operator is sufficient for modern browsers and IE.
      // When using `setAttribute`, IE skips "unload", WebKit skips "unload" and
      // "resize", whereas `in` "catches" those.
      eventName = 'on' + eventName;
      isSupported = eventName in element;

      // Fallback technique for old Firefox - bit.ly/event-detection
      if (!isSupported && needsFallback) {
        if (!element.setAttribute) {
          // Switch to generic element if it lacks `setAttribute`.
          // It could be the `document`, `window`, or something else.
          element = createElement('div');
        }

        element.setAttribute(eventName, '');
        isSupported = typeof element[eventName] === 'function';

        if (element[eventName] !== undefined) {
          // If property was created, "remove it" by setting value to `undefined`.
          element[eventName] = undefined;
        }
        element.removeAttribute(eventName);
      }

      return isSupported;
    }
    return inner;
  })();


  ModernizrProto.hasEvent = hasEvent;
  
/*!
{
  "name": "Hashchange event",
  "property": "hashchange",
  "caniuse": "hashchange",
  "tags": ["history"],
  "notes": [{
    "name": "MDN documentation",
    "href": "https://developer.mozilla.org/en-US/docs/Web/API/window.onhashchange"
  }],
  "polyfills": [
    "jquery-hashchange",
    "moo-historymanager",
    "jquery-ajaxy",
    "hasher",
    "shistory"
  ]
}
!*/
/* DOC
Detects support for the `hashchange` event, fired when the current location fragment changes.
*/

  Modernizr.addTest('hashchange', function() {
    if (hasEvent('hashchange', window) === false) {
      return false;
    }

    // documentMode logic from YUI to filter out IE8 Compat Mode
    //   which false positives.
    return (document.documentMode === undefined || document.documentMode > 7);
  });


  /**
   * since we have a fairly large number of input tests that don't mutate the input
   * we create a single element that can be shared with all of those tests for a
   * minor perf boost
   *
   * @access private
   * @returns {HTMLInputElement}
   */
  var inputElem = createElement('input');
  
/*!
{
  "name": "Form input types",
  "property": "inputtypes",
  "caniuse": "forms",
  "tags": ["forms"],
  "authors": ["Mike Taylor"],
  "polyfills": [
    "jquerytools",
    "webshims",
    "h5f",
    "webforms2",
    "nwxforms",
    "fdslider",
    "html5slider",
    "galleryhtml5forms",
    "jscolor",
    "html5formshim",
    "selectedoptionsjs",
    "formvalidationjs"
  ]
}
!*/
/* DOC
Detects support for HTML5 form input types and exposes Boolean subproperties with the results:

```javascript
Modernizr.inputtypes.color
Modernizr.inputtypes.date
Modernizr.inputtypes.datetime
Modernizr.inputtypes['datetime-local']
Modernizr.inputtypes.email
Modernizr.inputtypes.month
Modernizr.inputtypes.number
Modernizr.inputtypes.range
Modernizr.inputtypes.search
Modernizr.inputtypes.tel
Modernizr.inputtypes.time
Modernizr.inputtypes.url
Modernizr.inputtypes.week
```
*/

  // Run through HTML5's new input types to see if the UA understands any.
  //   This is put behind the tests runloop because it doesn't return a
  //   true/false like all the other tests; instead, it returns an object
  //   containing each input type with its corresponding true/false value

  // Big thanks to @miketaylr for the html5 forms expertise. miketaylr.com/
  var inputtypes = 'search tel url email datetime date month week time datetime-local number range color'.split(' ');
  var inputs = {};

  Modernizr.inputtypes = (function(props) {
    var len = props.length;
    var smile = '1)';
    var inputElemType;
    var defaultView;
    var bool;

    for (var i = 0; i < len; i++) {

      inputElem.setAttribute('type', inputElemType = props[i]);
      bool = inputElem.type !== 'text' && 'style' in inputElem;

      // We first check to see if the type we give it sticks..
      // If the type does, we feed it a textual value, which shouldn't be valid.
      // If the value doesn't stick, we know there's input sanitization which infers a custom UI
      if (bool) {

        inputElem.value         = smile;
        inputElem.style.cssText = 'position:absolute;visibility:hidden;';

        if (/^range$/.test(inputElemType) && inputElem.style.WebkitAppearance !== undefined) {

          docElement.appendChild(inputElem);
          defaultView = document.defaultView;

          // Safari 2-4 allows the smiley as a value, despite making a slider
          bool =  defaultView.getComputedStyle &&
            defaultView.getComputedStyle(inputElem, null).WebkitAppearance !== 'textfield' &&
            // Mobile android web browser has false positive, so must
            // check the height to see if the widget is actually there.
            (inputElem.offsetHeight !== 0);

          docElement.removeChild(inputElem);

        } else if (/^(search|tel)$/.test(inputElemType)) {
          // Spec doesn't define any special parsing or detectable UI
          //   behaviors so we pass these through as true

          // Interestingly, opera fails the earlier test, so it doesn't
          //  even make it here.

        } else if (/^(url|email)$/.test(inputElemType)) {
          // Real url and email support comes with prebaked validation.
          bool = inputElem.checkValidity && inputElem.checkValidity() === false;

        } else {
          // If the upgraded input compontent rejects the :) text, we got a winner
          bool = inputElem.value != smile;
        }
      }

      inputs[ props[i] ] = !!bool;
    }
    return inputs;
  })(inputtypes);


  /**
   * atRule returns a given CSS property at-rule (eg @keyframes), possibly in
   * some prefixed form, or false, in the case of an unsupported rule
   *
   * @memberof Modernizr
   * @name Modernizr.atRule
   * @optionName Modernizr.atRule()
   * @optionProp atRule
   * @access public
   * @function atRule
   * @param {string} prop - String name of the @-rule to test for
   * @returns {string|boolean} The string representing the (possibly prefixed)
   * valid version of the @-rule, or `false` when it is unsupported.
   * @example
   * ```js
   *  var keyframes = Modernizr.atRule('@keyframes');
   *
   *  if (keyframes) {
   *    // keyframes are supported
   *    // could be `@-webkit-keyframes` or `@keyframes`
   *  } else {
   *    // keyframes === `false`
   *  }
   * ```
   *
   */

  var atRule = function(prop) {
    var length = prefixes.length;
    var cssrule = window.CSSRule;
    var rule;

    if (typeof cssrule === 'undefined') {
      return undefined;
    }

    if (!prop) {
      return false;
    }

    // remove literal @ from beginning of provided property
    prop = prop.replace(/^@/, '');

    // CSSRules use underscores instead of dashes
    rule = prop.replace(/-/g, '_').toUpperCase() + '_RULE';

    if (rule in cssrule) {
      return '@' + prop;
    }

    for (var i = 0; i < length; i++) {
      // prefixes gives us something like -o-, and we want O_
      var prefix = prefixes[i];
      var thisRule = prefix.toUpperCase() + '_' + rule;

      if (thisRule in cssrule) {
        return '@-' + prefix.toLowerCase() + '-' + prop;
      }
    }

    return false;
  };

  ModernizrProto.atRule = atRule;

  

  /**
   * prefixed returns the prefixed or nonprefixed property name variant of your input
   *
   * @memberof Modernizr
   * @name Modernizr.prefixed
   * @optionName Modernizr.prefixed()
   * @optionProp prefixed
   * @access public
   * @function prefixed
   * @param {string} prop - String name of the property to test for
   * @param {object} [obj] - An object to test for the prefixed properties on
   * @param {HTMLElement} [elem] - An element used to test specific properties against
   * @returns {string|false} The string representing the (possibly prefixed) valid
   * version of the property, or `false` when it is unsupported.
   * @example
   *
   * Modernizr.prefixed takes a string css value in the DOM style camelCase (as
   * opposed to the css style kebab-case) form and returns the (possibly prefixed)
   * version of that property that the browser actually supports.
   *
   * For example, in older Firefox...
   * ```js
   * prefixed('boxSizing')
   * ```
   * returns 'MozBoxSizing'
   *
   * In newer Firefox, as well as any other browser that support the unprefixed
   * version would simply return `boxSizing`. Any browser that does not support
   * the property at all, it will return `false`.
   *
   * By default, prefixed is checked against a DOM element. If you want to check
   * for a property on another object, just pass it as a second argument
   *
   * ```js
   * var rAF = prefixed('requestAnimationFrame', window);
   *
   * raf(function() {
   *  renderFunction();
   * })
   * ```
   *
   * Note that this will return _the actual function_ - not the name of the function.
   * If you need the actual name of the property, pass in `false` as a third argument
   *
   * ```js
   * var rAFProp = prefixed('requestAnimationFrame', window, false);
   *
   * rafProp === 'WebkitRequestAnimationFrame' // in older webkit
   * ```
   *
   * One common use case for prefixed is if you're trying to determine which transition
   * end event to bind to, you might do something like...
   * ```js
   * var transEndEventNames = {
   *     'WebkitTransition' : 'webkitTransitionEnd', * Saf 6, Android Browser
   *     'MozTransition'    : 'transitionend',       * only for FF < 15
   *     'transition'       : 'transitionend'        * IE10, Opera, Chrome, FF 15+, Saf 7+
   * };
   *
   * var transEndEventName = transEndEventNames[ Modernizr.prefixed('transition') ];
   * ```
   *
   * If you want a similar lookup, but in kebab-case, you can use [prefixedCSS](#modernizr-prefixedcss).
   */

  var prefixed = ModernizrProto.prefixed = function(prop, obj, elem) {
    if (prop.indexOf('@') === 0) {
      return atRule(prop);
    }

    if (prop.indexOf('-') != -1) {
      // Convert kebab-case to camelCase
      prop = cssToDOM(prop);
    }
    if (!obj) {
      return testPropsAll(prop, 'pfx');
    } else {
      // Testing DOM property e.g. Modernizr.prefixed('requestAnimationFrame', window) // 'mozRequestAnimationFrame'
      return testPropsAll(prop, obj, elem);
    }
  };

  
/*!
{
  "name": "CSS Object Fit",
  "caniuse": "object-fit",
  "property": "objectfit",
  "tags": ["css"],
  "builderAliases": ["css_objectfit"],
  "notes": [{
    "name": "Opera Article on Object Fit",
    "href": "https://dev.opera.com/articles/css3-object-fit-object-position/"
  }]
}
!*/

  Modernizr.addTest('objectfit', !!prefixed('objectFit'), {aliases: ['object-fit']});


  // Run each test
  testRunner();

  // Remove the "no-js" class if it exists
  setClasses(classes);

  delete ModernizrProto.addTest;
  delete ModernizrProto.addAsyncTest;

  // Run the things that are supposed to run after the tests
  for (var i = 0; i < Modernizr._q.length; i++) {
    Modernizr._q[i]();
  }

  // Leak Modernizr namespace
  window.Modernizr = Modernizr;


;

})(window, document);
/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*! autotrack.js v0.6.5 */
!function t(e,i,n){function r(o,s){if(!i[o]){if(!e[o]){var l="function"==typeof require&&require;if(!s&&l)return l(o,!0);if(a)return a(o,!0);var u=new Error("Cannot find module '"+o+"'");throw u.code="MODULE_NOT_FOUND",u}var d=i[o]={exports:{}};e[o][0].call(d.exports,function(t){var i=e[o][1][t];return r(i?i:t)},d,d.exports,t,e,i,n)}return i[o].exports}for(var a="function"==typeof require&&require,o=0;o<n.length;o++)r(n[o]);return r}({1:[function(t,e,i){e.exports={DEV_ID:"i5iSjo"}},{}],2:[function(t,e,i){function n(t,e){if(window.addEventListener){this.opts=a(e,{attributePrefix:"data-"}),this.tracker=t;var i=this.opts.attributePrefix,n="["+i+"event-category]["+i+"event-action]";this.delegate=r(document,n,"click",this.handleEventClicks.bind(this))}}var r=t("delegate"),a=t("../utilities").defaults,o=t("../provide");n.prototype.handleEventClicks=function(t){var e=t.delegateTarget,i=this.opts.attributePrefix;this.tracker.send("event",{eventCategory:e.getAttribute(i+"event-category"),eventAction:e.getAttribute(i+"event-action"),eventLabel:e.getAttribute(i+"event-label"),eventValue:e.getAttribute(i+"event-value")})},n.prototype.remove=function(){this.delegate.destroy(),this.delegate=null,this.tracker=null,this.opts=null},o("eventTracker",n)},{"../provide":8,"../utilities":9,delegate:13}],3:[function(t,e,i){function n(t,e){window.matchMedia&&(this.opts=o(e,{mediaQueryDefinitions:!1,mediaQueryChangeTemplate:this.changeTemplate,mediaQueryChangeTimeout:1e3}),s(this.opts.mediaQueryDefinitions)&&(this.opts.mediaQueryDefinitions=l(this.opts.mediaQueryDefinitions),this.tracker=t,this.changeListeners=[],this.processMediaQueries()))}function r(t){return c[t]?c[t]:(c[t]=window.matchMedia(t),c[t])}var a=t("debounce"),o=t("../utilities").defaults,s=t("../utilities").isObject,l=t("../utilities").toArray,u=t("../provide"),d="(not set)",c={};n.prototype.processMediaQueries=function(){this.opts.mediaQueryDefinitions.forEach(function(t){if(t.name&&t.dimensionIndex){var e=this.getMatchName(t);this.tracker.set("dimension"+t.dimensionIndex,e),this.addChangeListeners(t)}}.bind(this))},n.prototype.getMatchName=function(t){var e;return t.items.forEach(function(t){r(t.media).matches&&(e=t)}),e?e.name:d},n.prototype.addChangeListeners=function(t){t.items.forEach(function(e){var i=r(e.media),n=a(function(){this.handleChanges(t)}.bind(this),this.opts.mediaQueryChangeTimeout);i.addListener(n),this.changeListeners.push({mql:i,fn:n})}.bind(this))},n.prototype.handleChanges=function(t){var e=this.getMatchName(t),i=this.tracker.get("dimension"+t.dimensionIndex);e!==i&&(this.tracker.set("dimension"+t.dimensionIndex,e),this.tracker.send("event",t.name,"change",this.opts.mediaQueryChangeTemplate(i,e)))},n.prototype.remove=function(){for(var t,e=0;t=this.changeListeners[e];e++)t.mql.removeListener(t.fn);this.changeListeners=null,this.tracker=null,this.opts=null},n.prototype.changeTemplate=function(t,e){return t+" => "+e},u("mediaQueryTracker",n)},{"../provide":8,"../utilities":9,debounce:12}],4:[function(t,e,i){function n(t,e){window.addEventListener&&(this.opts=r(e,{shouldTrackOutboundForm:this.shouldTrackOutboundForm}),this.tracker=t,this.delegate=a(document,"form","submit",this.handleFormSubmits.bind(this)))}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide"),s=t("../utilities");n.prototype.handleFormSubmits=function(t){var e=t.delegateTarget,i=e.getAttribute("action"),n={transport:"beacon"};this.opts.shouldTrackOutboundForm(e)&&(navigator.sendBeacon||(t.preventDefault(),n.hitCallback=s.withTimeout(function(){e.submit()})),this.tracker.send("event","Outbound Form","submit",i,n))},n.prototype.shouldTrackOutboundForm=function(t){var e=t.getAttribute("action");return e&&0===e.indexOf("http")&&e.indexOf(location.hostname)<0},n.prototype.remove=function(){this.delegate.destroy(),this.delegate=null,this.tracker=null,this.opts=null},o("outboundFormTracker",n)},{"../provide":8,"../utilities":9,delegate:13}],5:[function(t,e,i){function n(t,e){window.addEventListener&&(this.opts=r(e,{shouldTrackOutboundLink:this.shouldTrackOutboundLink}),this.tracker=t,this.delegate=a(document,"a","click",this.handleLinkClicks.bind(this)))}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide");n.prototype.handleLinkClicks=function(t){var e=t.delegateTarget;this.opts.shouldTrackOutboundLink(e)&&(navigator.sendBeacon||(e.target="_blank"),this.tracker.send("event","Outbound Link","click",e.href,{transport:"beacon"}))},n.prototype.shouldTrackOutboundLink=function(t){return t.hostname!=location.hostname&&0===t.protocol.indexOf("http")},n.prototype.remove=function(){this.delegate.destroy(),this.delegate=null,this.tracker=null,this.opts=null},o("outboundLinkTracker",n)},{"../provide":8,"../utilities":9,delegate:13}],6:[function(t,e,i){function n(t,e){if(window.addEventListener){this.opts=r(e,{attributePrefix:"data-"}),this.tracker=t;var i=this.opts.attributePrefix,n="["+i+"social-network]["+i+"social-action]["+i+"social-target]";this.handleSocialClicks=this.handleSocialClicks.bind(this),this.addWidgetListeners=this.addWidgetListeners.bind(this),this.addTwitterEventHandlers=this.addTwitterEventHandlers.bind(this),this.handleTweetEvents=this.handleTweetEvents.bind(this),this.handleFollowEvents=this.handleFollowEvents.bind(this),this.handleLikeEvents=this.handleLikeEvents.bind(this),this.handleUnlikeEvents=this.handleUnlikeEvents.bind(this),this.delegate=a(document,n,"click",this.handleSocialClicks),"complete"!=document.readyState?window.addEventListener("load",this.addWidgetListeners):this.addWidgetListeners()}}var r=t("../utilities").defaults,a=t("delegate"),o=t("../provide");n.prototype.addWidgetListeners=function(){window.FB&&this.addFacebookEventHandlers(),window.twttr&&this.addTwitterEventHandlers()},n.prototype.handleSocialClicks=function(t){var e=t.delegateTarget,i=this.opts.attributePrefix;this.tracker.send("social",{socialNetwork:e.getAttribute(i+"social-network"),socialAction:e.getAttribute(i+"social-action"),socialTarget:e.getAttribute(i+"social-target")})},n.prototype.addTwitterEventHandlers=function(){try{twttr.ready(function(){twttr.events.bind("tweet",this.handleTweetEvents),twttr.events.bind("follow",this.handleFollowEvents)}.bind(this))}catch(t){}},n.prototype.removeTwitterEventHandlers=function(){try{twttr.ready(function(){twttr.events.unbind("tweet",this.handleTweetEvents),twttr.events.unbind("follow",this.handleFollowEvents)}.bind(this))}catch(t){}},n.prototype.addFacebookEventHandlers=function(){try{FB.Event.subscribe("edge.create",this.handleLikeEvents),FB.Event.subscribe("edge.remove",this.handleUnlikeEvents)}catch(t){}},n.prototype.removeFacebookEventHandlers=function(){try{FB.Event.unsubscribe("edge.create",this.handleLikeEvents),FB.Event.unsubscribe("edge.remove",this.handleUnlikeEvents)}catch(t){}},n.prototype.handleTweetEvents=function(t){if("tweet"==t.region){var e=t.data.url||t.target.getAttribute("data-url")||location.href;this.tracker.send("social","Twitter","tweet",e)}},n.prototype.handleFollowEvents=function(t){if("follow"==t.region){var e=t.data.screen_name||t.target.getAttribute("data-screen-name");this.tracker.send("social","Twitter","follow",e)}},n.prototype.handleLikeEvents=function(t){this.tracker.send("social","Facebook","like",t)},n.prototype.handleUnlikeEvents=function(t){this.tracker.send("social","Facebook","unlike",t)},n.prototype.remove=function(){window.removeEventListener("load",this.addWidgetListeners),this.removeFacebookEventHandlers(),this.removeTwitterEventHandlers(),this.delegate.destroy(),this.delegate=null,this.tracker=null,this.opts=null,this.handleSocialClicks=null,this.addWidgetListeners=null,this.addTwitterEventHandlers=null,this.handleTweetEvents=null,this.handleFollowEvents=null,this.handleLikeEvents=null,this.handleUnlikeEvents=null},o("socialTracker",n)},{"../provide":8,"../utilities":9,delegate:13}],7:[function(t,e,i){function n(t,e){history.pushState&&window.addEventListener&&(this.opts=a(e,{shouldTrackUrlChange:this.shouldTrackUrlChange}),this.tracker=t,this.path=r(),this.updateTrackerData=this.updateTrackerData.bind(this),this.originalPushState=history.pushState,history.pushState=function(t,e){o(t)&&e&&(t.title=e),this.originalPushState.apply(history,arguments),this.updateTrackerData()}.bind(this),this.originalReplaceState=history.replaceState,history.replaceState=function(t,e){o(t)&&e&&(t.title=e),this.originalReplaceState.apply(history,arguments),this.updateTrackerData(!1)}.bind(this),window.addEventListener("popstate",this.updateTrackerData))}function r(){return location.pathname+location.search}var a=t("../utilities").defaults,o=t("../utilities").isObject,s=t("../provide");n.prototype.updateTrackerData=function(t){t=t!==!1,setTimeout(function(){var e=this.path,i=r();e!=i&&this.opts.shouldTrackUrlChange.call(this,i,e)&&(this.path=i,this.tracker.set({page:i,title:o(history.state)&&history.state.title||document.title}),t&&this.tracker.send("pageview"))}.bind(this),0)},n.prototype.shouldTrackUrlChange=function(t,e){return t&&e},n.prototype.remove=function(){window.removeEventListener("popstate",this.updateTrackerData),history.replaceState=this.originalReplaceState,history.pushState=this.originalPushState,this.tracker=null,this.opts=null,this.path=null,this.updateTrackerData=null,this.originalReplaceState=null,this.originalPushState=null},s("urlChangeTracker",n)},{"../provide":8,"../utilities":9}],8:[function(t,e,i){var n=t("./constants"),r=t("./utilities");(window.gaDevIds=window.gaDevIds||[]).push(n.DEV_ID),e.exports=function(t,e){var i=window.GoogleAnalyticsObject||"ga";window[i]=window[i]||function(){(window[i].q=window[i].q||[]).push(arguments)},window[i]("provide",t,e),window.gaplugins=window.gaplugins||{},window.gaplugins[r.capitalize(t)]=e}},{"./constants":1,"./utilities":9}],9:[function(t,e,i){var n={withTimeout:function(t,e){var i=!1;return setTimeout(t,e||2e3),function(){i||(i=!0,t())}},defaults:function(t,e){var i={};"object"!=typeof t&&(t={}),"object"!=typeof e&&(e={});for(var n in e)e.hasOwnProperty(n)&&(i[n]=t.hasOwnProperty(n)?t[n]:e[n]);return i},capitalize:function(t){return t.charAt(0).toUpperCase()+t.slice(1)},isObject:function(t){return"object"==typeof t&&null!==t},isArray:Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},toArray:function(t){return n.isArray(t)?t:[t]}};e.exports=n},{}],10:[function(t,e,i){var n=t("matches-selector");e.exports=function(t,e,i){for(var r=i?t:t.parentNode;r&&r!==document;){if(n(r,e))return r;r=r.parentNode}}},{"matches-selector":14}],11:[function(t,e,i){function n(){return(new Date).getTime()}e.exports=Date.now||n},{}],12:[function(t,e,i){var n=t("date-now");e.exports=function(t,e,i){function r(){var d=n()-l;e>d&&d>0?a=setTimeout(r,e-d):(a=null,i||(u=t.apply(s,o),a||(s=o=null)))}var a,o,s,l,u;return null==e&&(e=100),function(){s=this,o=arguments,l=n();var d=i&&!a;return a||(a=setTimeout(r,e)),d&&(u=t.apply(s,o),s=o=null),u}}},{"date-now":11}],13:[function(t,e,i){function n(t,e,i,n,a){var o=r.apply(this,arguments);return t.addEventListener(i,o,a),{destroy:function(){t.removeEventListener(i,o,a)}}}function r(t,e,i,n){return function(i){i.delegateTarget=a(i.target,e,!0),i.delegateTarget&&n.call(t,i)}}var a=t("closest");e.exports=n},{closest:10}],14:[function(t,e,i){function n(t,e){if(a)return a.call(t,e);for(var i=t.parentNode.querySelectorAll(e),n=0;n<i.length;++n)if(i[n]==t)return!0;return!1}var r=Element.prototype,a=r.matchesSelector||r.webkitMatchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector;e.exports=n},{}],15:[function(t,e,i){function n(t,e){var i=window[window.GoogleAnalyticsObject||"ga"],n=t.get("name");i(n+".require","eventTracker",e),i(n+".require","mediaQueryTracker",e),i(n+".require","outboundFormTracker",e),i(n+".require","outboundLinkTracker",e),i(n+".require","socialTracker",e),i(n+".require","urlChangeTracker",e)}t("./event-tracker"),t("./media-query-tracker"),t("./outbound-form-tracker"),t("./outbound-link-tracker"),t("./social-tracker"),t("./url-change-tracker");var r=t("../provide");r("autotrack",n)},{"../provide":8,"./event-tracker":2,"./media-query-tracker":3,"./outbound-form-tracker":4,"./outbound-link-tracker":5,"./social-tracker":6,"./url-change-tracker":7}]},{},[15]);
//# sourceMappingURL=autotrack.js.map

/*
 * Copyright 2016 Small Batch, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
/* Web Font Loader v1.6.26 - (c) Adobe Systems, Google. License: Apache 2.0 */(function(){function aa(a,b,c){return a.call.apply(a.bind,arguments)}function ba(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function p(a,b,c){p=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?aa:ba;return p.apply(null,arguments)}var q=Date.now||function(){return+new Date};function ca(a,b){this.a=a;this.m=b||a;this.c=this.m.document}var da=!!window.FontFace;function t(a,b,c,d){b=a.c.createElement(b);if(c)for(var e in c)c.hasOwnProperty(e)&&("style"==e?b.style.cssText=c[e]:b.setAttribute(e,c[e]));d&&b.appendChild(a.c.createTextNode(d));return b}function u(a,b,c){a=a.c.getElementsByTagName(b)[0];a||(a=document.documentElement);a.insertBefore(c,a.lastChild)}function v(a){a.parentNode&&a.parentNode.removeChild(a)}
function w(a,b,c){b=b||[];c=c||[];for(var d=a.className.split(/\s+/),e=0;e<b.length;e+=1){for(var f=!1,g=0;g<d.length;g+=1)if(b[e]===d[g]){f=!0;break}f||d.push(b[e])}b=[];for(e=0;e<d.length;e+=1){f=!1;for(g=0;g<c.length;g+=1)if(d[e]===c[g]){f=!0;break}f||b.push(d[e])}a.className=b.join(" ").replace(/\s+/g," ").replace(/^\s+|\s+$/,"")}function y(a,b){for(var c=a.className.split(/\s+/),d=0,e=c.length;d<e;d++)if(c[d]==b)return!0;return!1}
function z(a){if("string"===typeof a.f)return a.f;var b=a.m.location.protocol;"about:"==b&&(b=a.a.location.protocol);return"https:"==b?"https:":"http:"}function ea(a){return a.m.location.hostname||a.a.location.hostname}
function A(a,b,c){function d(){k&&e&&f&&(k(g),k=null)}b=t(a,"link",{rel:"stylesheet",href:b,media:"all"});var e=!1,f=!0,g=null,k=c||null;da?(b.onload=function(){e=!0;d()},b.onerror=function(){e=!0;g=Error("Stylesheet failed to load");d()}):setTimeout(function(){e=!0;d()},0);u(a,"head",b)}
function B(a,b,c,d){var e=a.c.getElementsByTagName("head")[0];if(e){var f=t(a,"script",{src:b}),g=!1;f.onload=f.onreadystatechange=function(){g||this.readyState&&"loaded"!=this.readyState&&"complete"!=this.readyState||(g=!0,c&&c(null),f.onload=f.onreadystatechange=null,"HEAD"==f.parentNode.tagName&&e.removeChild(f))};e.appendChild(f);setTimeout(function(){g||(g=!0,c&&c(Error("Script load timeout")))},d||5E3);return f}return null};function C(){this.a=0;this.c=null}function D(a){a.a++;return function(){a.a--;E(a)}}function F(a,b){a.c=b;E(a)}function E(a){0==a.a&&a.c&&(a.c(),a.c=null)};function G(a){this.a=a||"-"}G.prototype.c=function(a){for(var b=[],c=0;c<arguments.length;c++)b.push(arguments[c].replace(/[\W_]+/g,"").toLowerCase());return b.join(this.a)};function H(a,b){this.c=a;this.f=4;this.a="n";var c=(b||"n4").match(/^([nio])([1-9])$/i);c&&(this.a=c[1],this.f=parseInt(c[2],10))}function fa(a){return I(a)+" "+(a.f+"00")+" 300px "+J(a.c)}function J(a){var b=[];a=a.split(/,\s*/);for(var c=0;c<a.length;c++){var d=a[c].replace(/['"]/g,"");-1!=d.indexOf(" ")||/^\d/.test(d)?b.push("'"+d+"'"):b.push(d)}return b.join(",")}function K(a){return a.a+a.f}function I(a){var b="normal";"o"===a.a?b="oblique":"i"===a.a&&(b="italic");return b}
function ga(a){var b=4,c="n",d=null;a&&((d=a.match(/(normal|oblique|italic)/i))&&d[1]&&(c=d[1].substr(0,1).toLowerCase()),(d=a.match(/([1-9]00|normal|bold)/i))&&d[1]&&(/bold/i.test(d[1])?b=7:/[1-9]00/.test(d[1])&&(b=parseInt(d[1].substr(0,1),10))));return c+b};function ha(a,b){this.c=a;this.f=a.m.document.documentElement;this.h=b;this.a=new G("-");this.j=!1!==b.events;this.g=!1!==b.classes}function ia(a){a.g&&w(a.f,[a.a.c("wf","loading")]);L(a,"loading")}function M(a){if(a.g){var b=y(a.f,a.a.c("wf","active")),c=[],d=[a.a.c("wf","loading")];b||c.push(a.a.c("wf","inactive"));w(a.f,c,d)}L(a,"inactive")}function L(a,b,c){if(a.j&&a.h[b])if(c)a.h[b](c.c,K(c));else a.h[b]()};function ja(){this.c={}}function ka(a,b,c){var d=[],e;for(e in b)if(b.hasOwnProperty(e)){var f=a.c[e];f&&d.push(f(b[e],c))}return d};function N(a,b){this.c=a;this.f=b;this.a=t(this.c,"span",{"aria-hidden":"true"},this.f)}function O(a){u(a.c,"body",a.a)}function P(a){return"display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:"+J(a.c)+";"+("font-style:"+I(a)+";font-weight:"+(a.f+"00")+";")};function Q(a,b,c,d,e,f){this.g=a;this.j=b;this.a=d;this.c=c;this.f=e||3E3;this.h=f||void 0}Q.prototype.start=function(){var a=this.c.m.document,b=this,c=q(),d=new Promise(function(d,e){function k(){q()-c>=b.f?e():a.fonts.load(fa(b.a),b.h).then(function(a){1<=a.length?d():setTimeout(k,25)},function(){e()})}k()}),e=new Promise(function(a,d){setTimeout(d,b.f)});Promise.race([e,d]).then(function(){b.g(b.a)},function(){b.j(b.a)})};function R(a,b,c,d,e,f,g){this.v=a;this.B=b;this.c=c;this.a=d;this.s=g||"BESbswy";this.f={};this.w=e||3E3;this.u=f||null;this.o=this.j=this.h=this.g=null;this.g=new N(this.c,this.s);this.h=new N(this.c,this.s);this.j=new N(this.c,this.s);this.o=new N(this.c,this.s);a=new H(this.a.c+",serif",K(this.a));a=P(a);this.g.a.style.cssText=a;a=new H(this.a.c+",sans-serif",K(this.a));a=P(a);this.h.a.style.cssText=a;a=new H("serif",K(this.a));a=P(a);this.j.a.style.cssText=a;a=new H("sans-serif",K(this.a));a=
P(a);this.o.a.style.cssText=a;O(this.g);O(this.h);O(this.j);O(this.o)}var S={D:"serif",C:"sans-serif"},T=null;function U(){if(null===T){var a=/AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent);T=!!a&&(536>parseInt(a[1],10)||536===parseInt(a[1],10)&&11>=parseInt(a[2],10))}return T}R.prototype.start=function(){this.f.serif=this.j.a.offsetWidth;this.f["sans-serif"]=this.o.a.offsetWidth;this.A=q();la(this)};
function ma(a,b,c){for(var d in S)if(S.hasOwnProperty(d)&&b===a.f[S[d]]&&c===a.f[S[d]])return!0;return!1}function la(a){var b=a.g.a.offsetWidth,c=a.h.a.offsetWidth,d;(d=b===a.f.serif&&c===a.f["sans-serif"])||(d=U()&&ma(a,b,c));d?q()-a.A>=a.w?U()&&ma(a,b,c)&&(null===a.u||a.u.hasOwnProperty(a.a.c))?V(a,a.v):V(a,a.B):na(a):V(a,a.v)}function na(a){setTimeout(p(function(){la(this)},a),50)}function V(a,b){setTimeout(p(function(){v(this.g.a);v(this.h.a);v(this.j.a);v(this.o.a);b(this.a)},a),0)};function W(a,b,c){this.c=a;this.a=b;this.f=0;this.o=this.j=!1;this.s=c}var X=null;W.prototype.g=function(a){var b=this.a;b.g&&w(b.f,[b.a.c("wf",a.c,K(a).toString(),"active")],[b.a.c("wf",a.c,K(a).toString(),"loading"),b.a.c("wf",a.c,K(a).toString(),"inactive")]);L(b,"fontactive",a);this.o=!0;oa(this)};
W.prototype.h=function(a){var b=this.a;if(b.g){var c=y(b.f,b.a.c("wf",a.c,K(a).toString(),"active")),d=[],e=[b.a.c("wf",a.c,K(a).toString(),"loading")];c||d.push(b.a.c("wf",a.c,K(a).toString(),"inactive"));w(b.f,d,e)}L(b,"fontinactive",a);oa(this)};function oa(a){0==--a.f&&a.j&&(a.o?(a=a.a,a.g&&w(a.f,[a.a.c("wf","active")],[a.a.c("wf","loading"),a.a.c("wf","inactive")]),L(a,"active")):M(a.a))};function pa(a){this.j=a;this.a=new ja;this.h=0;this.f=this.g=!0}pa.prototype.load=function(a){this.c=new ca(this.j,a.context||this.j);this.g=!1!==a.events;this.f=!1!==a.classes;qa(this,new ha(this.c,a),a)};
function ra(a,b,c,d,e){var f=0==--a.h;(a.f||a.g)&&setTimeout(function(){var a=e||null,k=d||null||{};if(0===c.length&&f)M(b.a);else{b.f+=c.length;f&&(b.j=f);var h,m=[];for(h=0;h<c.length;h++){var l=c[h],n=k[l.c],r=b.a,x=l;r.g&&w(r.f,[r.a.c("wf",x.c,K(x).toString(),"loading")]);L(r,"fontloading",x);r=null;null===X&&(X=window.FontFace?(x=/Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent))?42<parseInt(x[1],10):!0:!1);X?r=new Q(p(b.g,b),p(b.h,b),b.c,l,b.s,n):r=new R(p(b.g,b),p(b.h,b),b.c,l,b.s,a,
n);m.push(r)}for(h=0;h<m.length;h++)m[h].start()}},0)}function qa(a,b,c){var d=[],e=c.timeout;ia(b);var d=ka(a.a,c,a.c),f=new W(a.c,b,e);a.h=d.length;b=0;for(c=d.length;b<c;b++)d[b].load(function(b,d,c){ra(a,f,b,d,c)})};function sa(a,b){this.c=a;this.a=b}function ta(a,b,c){var d=z(a.c);a=(a.a.api||"fast.fonts.net/jsapi").replace(/^.*http(s?):(\/\/)?/,"");return d+"//"+a+"/"+b+".js"+(c?"?v="+c:"")}
sa.prototype.load=function(a){function b(){if(f["__mti_fntLst"+d]){var c=f["__mti_fntLst"+d](),e=[],h;if(c)for(var m=0;m<c.length;m++){var l=c[m].fontfamily;void 0!=c[m].fontStyle&&void 0!=c[m].fontWeight?(h=c[m].fontStyle+c[m].fontWeight,e.push(new H(l,h))):e.push(new H(l))}a(e)}else setTimeout(function(){b()},50)}var c=this,d=c.a.projectId,e=c.a.version;if(d){var f=c.c.m;B(this.c,ta(c,d,e),function(e){e?a([]):(f["__MonotypeConfiguration__"+d]=function(){return c.a},b())}).id="__MonotypeAPIScript__"+
d}else a([])};function ua(a,b){this.c=a;this.a=b}ua.prototype.load=function(a){var b,c,d=this.a.urls||[],e=this.a.families||[],f=this.a.testStrings||{},g=new C;b=0;for(c=d.length;b<c;b++)A(this.c,d[b],D(g));var k=[];b=0;for(c=e.length;b<c;b++)if(d=e[b].split(":"),d[1])for(var h=d[1].split(","),m=0;m<h.length;m+=1)k.push(new H(d[0],h[m]));else k.push(new H(d[0]));F(g,function(){a(k,f)})};function va(a,b,c){a?this.c=a:this.c=b+wa;this.a=[];this.f=[];this.g=c||""}var wa="//fonts.googleapis.com/css";function xa(a,b){for(var c=b.length,d=0;d<c;d++){var e=b[d].split(":");3==e.length&&a.f.push(e.pop());var f="";2==e.length&&""!=e[1]&&(f=":");a.a.push(e.join(f))}}
function ya(a){if(0==a.a.length)throw Error("No fonts to load!");if(-1!=a.c.indexOf("kit="))return a.c;for(var b=a.a.length,c=[],d=0;d<b;d++)c.push(a.a[d].replace(/ /g,"+"));b=a.c+"?family="+c.join("%7C");0<a.f.length&&(b+="&subset="+a.f.join(","));0<a.g.length&&(b+="&text="+encodeURIComponent(a.g));return b};function za(a){this.f=a;this.a=[];this.c={}}
var Aa={latin:"BESbswy","latin-ext":"\u00e7\u00f6\u00fc\u011f\u015f",cyrillic:"\u0439\u044f\u0416",greek:"\u03b1\u03b2\u03a3",khmer:"\u1780\u1781\u1782",Hanuman:"\u1780\u1781\u1782"},Ba={thin:"1",extralight:"2","extra-light":"2",ultralight:"2","ultra-light":"2",light:"3",regular:"4",book:"4",medium:"5","semi-bold":"6",semibold:"6","demi-bold":"6",demibold:"6",bold:"7","extra-bold":"8",extrabold:"8","ultra-bold":"8",ultrabold:"8",black:"9",heavy:"9",l:"3",r:"4",b:"7"},Ca={i:"i",italic:"i",n:"n",normal:"n"},
Da=/^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
function Ea(a){for(var b=a.f.length,c=0;c<b;c++){var d=a.f[c].split(":"),e=d[0].replace(/\+/g," "),f=["n4"];if(2<=d.length){var g;var k=d[1];g=[];if(k)for(var k=k.split(","),h=k.length,m=0;m<h;m++){var l;l=k[m];if(l.match(/^[\w-]+$/)){var n=Da.exec(l.toLowerCase());if(null==n)l="";else{l=n[2];l=null==l||""==l?"n":Ca[l];n=n[1];if(null==n||""==n)n="4";else var r=Ba[n],n=r?r:isNaN(n)?"4":n.substr(0,1);l=[l,n].join("")}}else l="";l&&g.push(l)}0<g.length&&(f=g);3==d.length&&(d=d[2],g=[],d=d?d.split(","):
g,0<d.length&&(d=Aa[d[0]])&&(a.c[e]=d))}a.c[e]||(d=Aa[e])&&(a.c[e]=d);for(d=0;d<f.length;d+=1)a.a.push(new H(e,f[d]))}};function Fa(a,b){this.c=a;this.a=b}var Ga={Arimo:!0,Cousine:!0,Tinos:!0};Fa.prototype.load=function(a){var b=new C,c=this.c,d=new va(this.a.api,z(c),this.a.text),e=this.a.families;xa(d,e);var f=new za(e);Ea(f);A(c,ya(d),D(b));F(b,function(){a(f.a,f.c,Ga)})};function Ha(a,b){this.c=a;this.a=b}Ha.prototype.load=function(a){var b=this.a.id,c=this.c.m;b?B(this.c,(this.a.api||"https://use.typekit.net")+"/"+b+".js",function(b){if(b)a([]);else if(c.Typekit&&c.Typekit.config&&c.Typekit.config.fn){b=c.Typekit.config.fn;for(var e=[],f=0;f<b.length;f+=2)for(var g=b[f],k=b[f+1],h=0;h<k.length;h++)e.push(new H(g,k[h]));try{c.Typekit.load({events:!1,classes:!1,async:!0})}catch(m){}a(e)}},2E3):a([])};function Ia(a,b){this.c=a;this.f=b;this.a=[]}Ia.prototype.load=function(a){var b=this.f.id,c=this.c.m,d=this;b?(c.__webfontfontdeckmodule__||(c.__webfontfontdeckmodule__={}),c.__webfontfontdeckmodule__[b]=function(b,c){for(var g=0,k=c.fonts.length;g<k;++g){var h=c.fonts[g];d.a.push(new H(h.name,ga("font-weight:"+h.weight+";font-style:"+h.style)))}a(d.a)},B(this.c,z(this.c)+(this.f.api||"//f.fontdeck.com/s/css/js/")+ea(this.c)+"/"+b+".js",function(b){b&&a([])})):a([])};var Y=new pa(window);Y.a.c.custom=function(a,b){return new ua(b,a)};Y.a.c.fontdeck=function(a,b){return new Ia(b,a)};Y.a.c.monotype=function(a,b){return new sa(b,a)};Y.a.c.typekit=function(a,b){return new Ha(b,a)};Y.a.c.google=function(a,b){return new Fa(b,a)};var Z={load:p(Y.load,Y)};"function"===typeof define&&define.amd?define(function(){return Z}):"undefined"!==typeof module&&module.exports?module.exports=Z:(window.WebFont=Z,window.WebFontConfig&&Y.load(window.WebFontConfig));}());
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZGVybml6ci5qcyIsImF1dG90cmFjay5qcyIsIndlYmZvbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ254RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJoZWFkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBtb2Rlcm5penIgdjMuNi4wXG4gKiBCdWlsZCBodHRwczovL21vZGVybml6ci5jb20vZG93bmxvYWQ/LWNzc3RyYW5zZm9ybXMtY3NzdHJhbnNpdGlvbnMtaGFzaGNoYW5nZS1pbnB1dHR5cGVzLW9iamVjdGZpdC1wbGFjZWhvbGRlci1zdmdhc2ltZy10b3VjaGV2ZW50cy1hZGR0ZXN0LWZuYmluZC1tcS1wcmludHNoaXYtc2V0Y2xhc3Nlcy10ZXN0cHJvcC1kb250bWluXG4gKlxuICogQ29weXJpZ2h0IChjKVxuICogIEZhcnVrIEF0ZXNcbiAqICBQYXVsIElyaXNoXG4gKiAgQWxleCBTZXh0b25cbiAqICBSeWFuIFNlZGRvblxuICogIFBhdHJpY2sgS2V0dG5lclxuICogIFN0dSBDb3hcbiAqICBSaWNoYXJkIEhlcnJlcmFcblxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKlxuICogTW9kZXJuaXpyIHRlc3RzIHdoaWNoIG5hdGl2ZSBDU1MzIGFuZCBIVE1MNSBmZWF0dXJlcyBhcmUgYXZhaWxhYmxlIGluIHRoZVxuICogY3VycmVudCBVQSBhbmQgbWFrZXMgdGhlIHJlc3VsdHMgYXZhaWxhYmxlIHRvIHlvdSBpbiB0d28gd2F5czogYXMgcHJvcGVydGllcyBvblxuICogYSBnbG9iYWwgYE1vZGVybml6cmAgb2JqZWN0LCBhbmQgYXMgY2xhc3NlcyBvbiB0aGUgYDxodG1sPmAgZWxlbWVudC4gVGhpc1xuICogaW5mb3JtYXRpb24gYWxsb3dzIHlvdSB0byBwcm9ncmVzc2l2ZWx5IGVuaGFuY2UgeW91ciBwYWdlcyB3aXRoIGEgZ3JhbnVsYXIgbGV2ZWxcbiAqIG9mIGNvbnRyb2wgb3ZlciB0aGUgZXhwZXJpZW5jZS5cbiovXG5cbjsoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgdW5kZWZpbmVkKXtcbiAgdmFyIHRlc3RzID0gW107XG4gIFxuXG4gIC8qKlxuICAgKlxuICAgKiBNb2Rlcm5penJQcm90byBpcyB0aGUgY29uc3RydWN0b3IgZm9yIE1vZGVybml6clxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICovXG5cbiAgdmFyIE1vZGVybml6clByb3RvID0ge1xuICAgIC8vIFRoZSBjdXJyZW50IHZlcnNpb24sIGR1bW15XG4gICAgX3ZlcnNpb246ICczLjYuMCcsXG5cbiAgICAvLyBBbnkgc2V0dGluZ3MgdGhhdCBkb24ndCB3b3JrIGFzIHNlcGFyYXRlIG1vZHVsZXNcbiAgICAvLyBjYW4gZ28gaW4gaGVyZSBhcyBjb25maWd1cmF0aW9uLlxuICAgIF9jb25maWc6IHtcbiAgICAgICdjbGFzc1ByZWZpeCc6ICcnLFxuICAgICAgJ2VuYWJsZUNsYXNzZXMnOiB0cnVlLFxuICAgICAgJ2VuYWJsZUpTQ2xhc3MnOiB0cnVlLFxuICAgICAgJ3VzZVByZWZpeGVzJzogdHJ1ZVxuICAgIH0sXG5cbiAgICAvLyBRdWV1ZSBvZiB0ZXN0c1xuICAgIF9xOiBbXSxcblxuICAgIC8vIFN0dWIgdGhlc2UgZm9yIHBlb3BsZSB3aG8gYXJlIGxpc3RlbmluZ1xuICAgIG9uOiBmdW5jdGlvbih0ZXN0LCBjYikge1xuICAgICAgLy8gSSBkb24ndCByZWFsbHkgdGhpbmsgcGVvcGxlIHNob3VsZCBkbyB0aGlzLCBidXQgd2UgY2FuXG4gICAgICAvLyBzYWZlIGd1YXJkIGl0IGEgYml0LlxuICAgICAgLy8gLS0gTk9URTo6IHRoaXMgZ2V0cyBXQVkgb3ZlcnJpZGRlbiBpbiBzcmMvYWRkVGVzdCBmb3IgYWN0dWFsIGFzeW5jIHRlc3RzLlxuICAgICAgLy8gVGhpcyBpcyBpbiBjYXNlIHBlb3BsZSBsaXN0ZW4gdG8gc3luY2hyb25vdXMgdGVzdHMuIEkgd291bGQgbGVhdmUgaXQgb3V0LFxuICAgICAgLy8gYnV0IHRoZSBjb2RlIHRvICpkaXNhbGxvdyogc3luYyB0ZXN0cyBpbiB0aGUgcmVhbCB2ZXJzaW9uIG9mIHRoaXNcbiAgICAgIC8vIGZ1bmN0aW9uIGlzIGFjdHVhbGx5IGxhcmdlciB0aGFuIHRoaXMuXG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBjYihzZWxmW3Rlc3RdKTtcbiAgICAgIH0sIDApO1xuICAgIH0sXG5cbiAgICBhZGRUZXN0OiBmdW5jdGlvbihuYW1lLCBmbiwgb3B0aW9ucykge1xuICAgICAgdGVzdHMucHVzaCh7bmFtZTogbmFtZSwgZm46IGZuLCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgfSxcblxuICAgIGFkZEFzeW5jVGVzdDogZnVuY3Rpb24oZm4pIHtcbiAgICAgIHRlc3RzLnB1c2goe25hbWU6IG51bGwsIGZuOiBmbn0pO1xuICAgIH1cbiAgfTtcblxuICBcblxuICAvLyBGYWtlIHNvbWUgb2YgT2JqZWN0LmNyZWF0ZSBzbyB3ZSBjYW4gZm9yY2Ugbm9uIHRlc3QgcmVzdWx0cyB0byBiZSBub24gXCJvd25cIiBwcm9wZXJ0aWVzLlxuICB2YXIgTW9kZXJuaXpyID0gZnVuY3Rpb24oKSB7fTtcbiAgTW9kZXJuaXpyLnByb3RvdHlwZSA9IE1vZGVybml6clByb3RvO1xuXG4gIC8vIExlYWsgbW9kZXJuaXpyIGdsb2JhbGx5IHdoZW4geW91IGByZXF1aXJlYCBpdCByYXRoZXIgdGhhbiBmb3JjZSBpdCBoZXJlLlxuICAvLyBPdmVyd3JpdGUgbmFtZSBzbyBjb25zdHJ1Y3RvciBuYW1lIGlzIG5pY2VyIDpEXG4gIE1vZGVybml6ciA9IG5ldyBNb2Rlcm5penIoKTtcblxuICBcblxuICB2YXIgY2xhc3NlcyA9IFtdO1xuICBcblxuICAvKipcbiAgICogaXMgcmV0dXJucyBhIGJvb2xlYW4gaWYgdGhlIHR5cGVvZiBhbiBvYmogaXMgZXhhY3RseSB0eXBlLlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIGlzXG4gICAqIEBwYXJhbSB7Kn0gb2JqIC0gQSB0aGluZyB3ZSB3YW50IHRvIGNoZWNrIHRoZSB0eXBlIG9mXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gQSBzdHJpbmcgdG8gY29tcGFyZSB0aGUgdHlwZW9mIGFnYWluc3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGlzKG9iaiwgdHlwZSkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSB0eXBlO1xuICB9XG4gIDtcblxuICAvKipcbiAgICogUnVuIHRocm91Z2ggYWxsIHRlc3RzIGFuZCBkZXRlY3QgdGhlaXIgc3VwcG9ydCBpbiB0aGUgY3VycmVudCBVQS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHRlc3RSdW5uZXIoKSB7XG4gICAgdmFyIGZlYXR1cmVOYW1lcztcbiAgICB2YXIgZmVhdHVyZTtcbiAgICB2YXIgYWxpYXNJZHg7XG4gICAgdmFyIHJlc3VsdDtcbiAgICB2YXIgbmFtZUlkeDtcbiAgICB2YXIgZmVhdHVyZU5hbWU7XG4gICAgdmFyIGZlYXR1cmVOYW1lU3BsaXQ7XG5cbiAgICBmb3IgKHZhciBmZWF0dXJlSWR4IGluIHRlc3RzKSB7XG4gICAgICBpZiAodGVzdHMuaGFzT3duUHJvcGVydHkoZmVhdHVyZUlkeCkpIHtcbiAgICAgICAgZmVhdHVyZU5hbWVzID0gW107XG4gICAgICAgIGZlYXR1cmUgPSB0ZXN0c1tmZWF0dXJlSWR4XTtcbiAgICAgICAgLy8gcnVuIHRoZSB0ZXN0LCB0aHJvdyB0aGUgcmV0dXJuIHZhbHVlIGludG8gdGhlIE1vZGVybml6cixcbiAgICAgICAgLy8gdGhlbiBiYXNlZCBvbiB0aGF0IGJvb2xlYW4sIGRlZmluZSBhbiBhcHByb3ByaWF0ZSBjbGFzc05hbWVcbiAgICAgICAgLy8gYW5kIHB1c2ggaXQgaW50byBhbiBhcnJheSBvZiBjbGFzc2VzIHdlJ2xsIGpvaW4gbGF0ZXIuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIG5vIG5hbWUsIGl0J3MgYW4gJ2FzeW5jJyB0ZXN0IHRoYXQgaXMgcnVuLFxuICAgICAgICAvLyBidXQgbm90IGRpcmVjdGx5IGFkZGVkIHRvIHRoZSBvYmplY3QuIFRoYXQgc2hvdWxkXG4gICAgICAgIC8vIGJlIGRvbmUgd2l0aCBhIHBvc3QtcnVuIGFkZFRlc3QgY2FsbC5cbiAgICAgICAgaWYgKGZlYXR1cmUubmFtZSkge1xuICAgICAgICAgIGZlYXR1cmVOYW1lcy5wdXNoKGZlYXR1cmUubmFtZS50b0xvd2VyQ2FzZSgpKTtcblxuICAgICAgICAgIGlmIChmZWF0dXJlLm9wdGlvbnMgJiYgZmVhdHVyZS5vcHRpb25zLmFsaWFzZXMgJiYgZmVhdHVyZS5vcHRpb25zLmFsaWFzZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBBZGQgYWxsIHRoZSBhbGlhc2VzIGludG8gdGhlIG5hbWVzIGxpc3RcbiAgICAgICAgICAgIGZvciAoYWxpYXNJZHggPSAwOyBhbGlhc0lkeCA8IGZlYXR1cmUub3B0aW9ucy5hbGlhc2VzLmxlbmd0aDsgYWxpYXNJZHgrKykge1xuICAgICAgICAgICAgICBmZWF0dXJlTmFtZXMucHVzaChmZWF0dXJlLm9wdGlvbnMuYWxpYXNlc1thbGlhc0lkeF0udG9Mb3dlckNhc2UoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUnVuIHRoZSB0ZXN0LCBvciB1c2UgdGhlIHJhdyB2YWx1ZSBpZiBpdCdzIG5vdCBhIGZ1bmN0aW9uXG4gICAgICAgIHJlc3VsdCA9IGlzKGZlYXR1cmUuZm4sICdmdW5jdGlvbicpID8gZmVhdHVyZS5mbigpIDogZmVhdHVyZS5mbjtcblxuXG4gICAgICAgIC8vIFNldCBlYWNoIG9mIHRoZSBuYW1lcyBvbiB0aGUgTW9kZXJuaXpyIG9iamVjdFxuICAgICAgICBmb3IgKG5hbWVJZHggPSAwOyBuYW1lSWR4IDwgZmVhdHVyZU5hbWVzLmxlbmd0aDsgbmFtZUlkeCsrKSB7XG4gICAgICAgICAgZmVhdHVyZU5hbWUgPSBmZWF0dXJlTmFtZXNbbmFtZUlkeF07XG4gICAgICAgICAgLy8gU3VwcG9ydCBkb3QgcHJvcGVydGllcyBhcyBzdWIgdGVzdHMuIFdlIGRvbid0IGRvIGNoZWNraW5nIHRvIG1ha2Ugc3VyZVxuICAgICAgICAgIC8vIHRoYXQgdGhlIGltcGxpZWQgcGFyZW50IHRlc3RzIGhhdmUgYmVlbiBhZGRlZC4gWW91IG11c3QgY2FsbCB0aGVtIGluXG4gICAgICAgICAgLy8gb3JkZXIgKGVpdGhlciBpbiB0aGUgdGVzdCwgb3IgbWFrZSB0aGUgcGFyZW50IHRlc3QgYSBkZXBlbmRlbmN5KS5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIENhcCBpdCB0byBUV08gdG8gbWFrZSB0aGUgbG9naWMgc2ltcGxlIGFuZCBiZWNhdXNlIHdobyBuZWVkcyB0aGF0IGtpbmQgb2Ygc3VidGVzdGluZ1xuICAgICAgICAgIC8vIGhhc2h0YWcgZmFtb3VzIGxhc3Qgd29yZHNcbiAgICAgICAgICBmZWF0dXJlTmFtZVNwbGl0ID0gZmVhdHVyZU5hbWUuc3BsaXQoJy4nKTtcblxuICAgICAgICAgIGlmIChmZWF0dXJlTmFtZVNwbGl0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dID0gcmVzdWx0O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjYXN0IHRvIGEgQm9vbGVhbiwgaWYgbm90IG9uZSBhbHJlYWR5XG4gICAgICAgICAgICBpZiAoTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dICYmICEoTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dIGluc3RhbmNlb2YgQm9vbGVhbikpIHtcbiAgICAgICAgICAgICAgTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dID0gbmV3IEJvb2xlYW4oTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dW2ZlYXR1cmVOYW1lU3BsaXRbMV1dID0gcmVzdWx0O1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNsYXNzZXMucHVzaCgocmVzdWx0ID8gJycgOiAnbm8tJykgKyBmZWF0dXJlTmFtZVNwbGl0LmpvaW4oJy0nKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgO1xuXG4gIC8qKlxuICAgKiBkb2NFbGVtZW50IGlzIGEgY29udmVuaWVuY2Ugd3JhcHBlciB0byBncmFiIHRoZSByb290IGVsZW1lbnQgb2YgdGhlIGRvY3VtZW50XG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7SFRNTEVsZW1lbnR8U1ZHRWxlbWVudH0gVGhlIHJvb3QgZWxlbWVudCBvZiB0aGUgZG9jdW1lbnRcbiAgICovXG5cbiAgdmFyIGRvY0VsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIFxuXG4gIC8qKlxuICAgKiBBIGNvbnZlbmllbmNlIGhlbHBlciB0byBjaGVjayBpZiB0aGUgZG9jdW1lbnQgd2UgYXJlIHJ1bm5pbmcgaW4gaXMgYW4gU1ZHIGRvY3VtZW50XG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG5cbiAgdmFyIGlzU1ZHID0gZG9jRWxlbWVudC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpID09PSAnc3ZnJztcbiAgXG5cbiAgLyoqXG4gICAqIHNldENsYXNzZXMgdGFrZXMgYW4gYXJyYXkgb2YgY2xhc3MgbmFtZXMgYW5kIGFkZHMgdGhlbSB0byB0aGUgcm9vdCBlbGVtZW50XG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb24gc2V0Q2xhc3Nlc1xuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBjbGFzc2VzIC0gQXJyYXkgb2YgY2xhc3MgbmFtZXNcbiAgICovXG5cbiAgLy8gUGFzcyBpbiBhbiBhbmQgYXJyYXkgb2YgY2xhc3MgbmFtZXMsIGUuZy46XG4gIC8vICBbJ25vLXdlYnAnLCAnYm9yZGVycmFkaXVzJywgLi4uXVxuICBmdW5jdGlvbiBzZXRDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gZG9jRWxlbWVudC5jbGFzc05hbWU7XG4gICAgdmFyIGNsYXNzUHJlZml4ID0gTW9kZXJuaXpyLl9jb25maWcuY2xhc3NQcmVmaXggfHwgJyc7XG5cbiAgICBpZiAoaXNTVkcpIHtcbiAgICAgIGNsYXNzTmFtZSA9IGNsYXNzTmFtZS5iYXNlVmFsO1xuICAgIH1cblxuICAgIC8vIENoYW5nZSBgbm8tanNgIHRvIGBqc2AgKGluZGVwZW5kZW50bHkgb2YgdGhlIGBlbmFibGVDbGFzc2VzYCBvcHRpb24pXG4gICAgLy8gSGFuZGxlIGNsYXNzUHJlZml4IG9uIHRoaXMgdG9vXG4gICAgaWYgKE1vZGVybml6ci5fY29uZmlnLmVuYWJsZUpTQ2xhc3MpIHtcbiAgICAgIHZhciByZUpTID0gbmV3IFJlZ0V4cCgnKF58XFxcXHMpJyArIGNsYXNzUHJlZml4ICsgJ25vLWpzKFxcXFxzfCQpJyk7XG4gICAgICBjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZShyZUpTLCAnJDEnICsgY2xhc3NQcmVmaXggKyAnanMkMicpO1xuICAgIH1cblxuICAgIGlmIChNb2Rlcm5penIuX2NvbmZpZy5lbmFibGVDbGFzc2VzKSB7XG4gICAgICAvLyBBZGQgdGhlIG5ldyBjbGFzc2VzXG4gICAgICBjbGFzc05hbWUgKz0gJyAnICsgY2xhc3NQcmVmaXggKyBjbGFzc2VzLmpvaW4oJyAnICsgY2xhc3NQcmVmaXgpO1xuICAgICAgaWYgKGlzU1ZHKSB7XG4gICAgICAgIGRvY0VsZW1lbnQuY2xhc3NOYW1lLmJhc2VWYWwgPSBjbGFzc05hbWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2NFbGVtZW50LmNsYXNzTmFtZSA9IGNsYXNzTmFtZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG4gIDtcblxuICAvKipcbiAgICogaGFzT3duUHJvcCBpcyBhIHNoaW0gZm9yIGhhc093blByb3BlcnR5IHRoYXQgaXMgbmVlZGVkIGZvciBTYWZhcmkgMi4wIHN1cHBvcnRcbiAgICpcbiAgICogQGF1dGhvciBrYW5nYXhcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqIEBmdW5jdGlvbiBoYXNPd25Qcm9wXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgLSBUaGUgb2JqZWN0IHRvIGNoZWNrIGZvciBhIHByb3BlcnR5XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSAtIFRoZSBwcm9wZXJ0eSB0byBjaGVjayBmb3JcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG4gIC8vIGhhc093blByb3BlcnR5IHNoaW0gYnkga2FuZ2F4IG5lZWRlZCBmb3IgU2FmYXJpIDIuMCBzdXBwb3J0XG4gIHZhciBoYXNPd25Qcm9wO1xuXG4gIChmdW5jdGlvbigpIHtcbiAgICB2YXIgX2hhc093blByb3BlcnR5ID0gKHt9KS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgIC8qIHdlIGhhdmUgbm8gd2F5IG9mIHRlc3RpbmcgSUUgNS41IG9yIHNhZmFyaSAyLFxuICAgICAqIHNvIGp1c3QgYXNzdW1lIHRoZSBlbHNlIGdldHMgaGl0ICovXG4gICAgaWYgKCFpcyhfaGFzT3duUHJvcGVydHksICd1bmRlZmluZWQnKSAmJiAhaXMoX2hhc093blByb3BlcnR5LmNhbGwsICd1bmRlZmluZWQnKSkge1xuICAgICAgaGFzT3duUHJvcCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIF9oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBoYXNPd25Qcm9wID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyAvKiB5ZXMsIHRoaXMgY2FuIGdpdmUgZmFsc2UgcG9zaXRpdmVzL25lZ2F0aXZlcywgYnV0IG1vc3Qgb2YgdGhlIHRpbWUgd2UgZG9uJ3QgY2FyZSBhYm91dCB0aG9zZSAqL1xuICAgICAgICByZXR1cm4gKChwcm9wZXJ0eSBpbiBvYmplY3QpICYmIGlzKG9iamVjdC5jb25zdHJ1Y3Rvci5wcm90b3R5cGVbcHJvcGVydHldLCAndW5kZWZpbmVkJykpO1xuICAgICAgfTtcbiAgICB9XG4gIH0pKCk7XG5cbiAgXG5cblxuICAgLy8gX2wgdHJhY2tzIGxpc3RlbmVycyBmb3IgYXN5bmMgdGVzdHMsIGFzIHdlbGwgYXMgdGVzdHMgdGhhdCBleGVjdXRlIGFmdGVyIHRoZSBpbml0aWFsIHJ1blxuICBNb2Rlcm5penJQcm90by5fbCA9IHt9O1xuXG4gIC8qKlxuICAgKiBNb2Rlcm5penIub24gaXMgYSB3YXkgdG8gbGlzdGVuIGZvciB0aGUgY29tcGxldGlvbiBvZiBhc3luYyB0ZXN0cy4gQmVpbmdcbiAgICogYXN5bmNocm9ub3VzLCB0aGV5IG1heSBub3QgZmluaXNoIGJlZm9yZSB5b3VyIHNjcmlwdHMgcnVuLiBBcyBhIHJlc3VsdCB5b3VcbiAgICogd2lsbCBnZXQgYSBwb3NzaWJseSBmYWxzZSBuZWdhdGl2ZSBgdW5kZWZpbmVkYCB2YWx1ZS5cbiAgICpcbiAgICogQG1lbWJlcm9mIE1vZGVybml6clxuICAgKiBAbmFtZSBNb2Rlcm5penIub25cbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICogQGZ1bmN0aW9uIG9uXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmZWF0dXJlIC0gU3RyaW5nIG5hbWUgb2YgdGhlIGZlYXR1cmUgZGV0ZWN0XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgZnVuY3Rpb24gcmV0dXJuaW5nIGEgQm9vbGVhbiAtIHRydWUgaWYgZmVhdHVyZSBpcyBzdXBwb3J0ZWQsIGZhbHNlIGlmIG5vdFxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBgYGBqc1xuICAgKiBNb2Rlcm5penIub24oJ2ZsYXNoJywgZnVuY3Rpb24oIHJlc3VsdCApIHtcbiAgICogICBpZiAocmVzdWx0KSB7XG4gICAqICAgIC8vIHRoZSBicm93c2VyIGhhcyBmbGFzaFxuICAgKiAgIH0gZWxzZSB7XG4gICAqICAgICAvLyB0aGUgYnJvd3NlciBkb2VzIG5vdCBoYXZlIGZsYXNoXG4gICAqICAgfVxuICAgKiB9KTtcbiAgICogYGBgXG4gICAqL1xuXG4gIE1vZGVybml6clByb3RvLm9uID0gZnVuY3Rpb24oZmVhdHVyZSwgY2IpIHtcbiAgICAvLyBDcmVhdGUgdGhlIGxpc3Qgb2YgbGlzdGVuZXJzIGlmIGl0IGRvZXNuJ3QgZXhpc3RcbiAgICBpZiAoIXRoaXMuX2xbZmVhdHVyZV0pIHtcbiAgICAgIHRoaXMuX2xbZmVhdHVyZV0gPSBbXTtcbiAgICB9XG5cbiAgICAvLyBQdXNoIHRoaXMgdGVzdCBvbiB0byB0aGUgbGlzdGVuZXIgbGlzdFxuICAgIHRoaXMuX2xbZmVhdHVyZV0ucHVzaChjYik7XG5cbiAgICAvLyBJZiBpdCdzIGFscmVhZHkgYmVlbiByZXNvbHZlZCwgdHJpZ2dlciBpdCBvbiBuZXh0IHRpY2tcbiAgICBpZiAoTW9kZXJuaXpyLmhhc093blByb3BlcnR5KGZlYXR1cmUpKSB7XG4gICAgICAvLyBOZXh0IFRpY2tcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIE1vZGVybml6ci5fdHJpZ2dlcihmZWF0dXJlLCBNb2Rlcm5penJbZmVhdHVyZV0pO1xuICAgICAgfSwgMCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBfdHJpZ2dlciBpcyB0aGUgcHJpdmF0ZSBmdW5jdGlvbiB1c2VkIHRvIHNpZ25hbCB0ZXN0IGNvbXBsZXRpb24gYW5kIHJ1biBhbnlcbiAgICogY2FsbGJhY2tzIHJlZ2lzdGVyZWQgdGhyb3VnaCBbTW9kZXJuaXpyLm9uXSgjbW9kZXJuaXpyLW9uKVxuICAgKlxuICAgKiBAbWVtYmVyb2YgTW9kZXJuaXpyXG4gICAqIEBuYW1lIE1vZGVybml6ci5fdHJpZ2dlclxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIF90cmlnZ2VyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmZWF0dXJlIC0gc3RyaW5nIG5hbWUgb2YgdGhlIGZlYXR1cmUgZGV0ZWN0XG4gICAqIEBwYXJhbSB7ZnVuY3Rpb258Ym9vbGVhbn0gW3Jlc10gLSBBIGZlYXR1cmUgZGV0ZWN0aW9uIGZ1bmN0aW9uLCBvciB0aGUgYm9vbGVhbiA9XG4gICAqIHJlc3VsdCBvZiBhIGZlYXR1cmUgZGV0ZWN0aW9uIGZ1bmN0aW9uXG4gICAqL1xuXG4gIE1vZGVybml6clByb3RvLl90cmlnZ2VyID0gZnVuY3Rpb24oZmVhdHVyZSwgcmVzKSB7XG4gICAgaWYgKCF0aGlzLl9sW2ZlYXR1cmVdKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGNicyA9IHRoaXMuX2xbZmVhdHVyZV07XG5cbiAgICAvLyBGb3JjZSBhc3luY1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSwgY2I7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNiID0gY2JzW2ldO1xuICAgICAgICBjYihyZXMpO1xuICAgICAgfVxuICAgIH0sIDApO1xuXG4gICAgLy8gRG9uJ3QgdHJpZ2dlciB0aGVzZSBhZ2FpblxuICAgIGRlbGV0ZSB0aGlzLl9sW2ZlYXR1cmVdO1xuICB9O1xuXG4gIC8qKlxuICAgKiBhZGRUZXN0IGFsbG93cyB5b3UgdG8gZGVmaW5lIHlvdXIgb3duIGZlYXR1cmUgZGV0ZWN0cyB0aGF0IGFyZSBub3QgY3VycmVudGx5XG4gICAqIGluY2x1ZGVkIGluIE1vZGVybml6ciAodW5kZXIgdGhlIGNvdmVycyBpdCdzIHRoZSBleGFjdCBzYW1lIGNvZGUgTW9kZXJuaXpyXG4gICAqIHVzZXMgZm9yIGl0cyBvd24gW2ZlYXR1cmUgZGV0ZWN0aW9uc10oaHR0cHM6Ly9naXRodWIuY29tL01vZGVybml6ci9Nb2Rlcm5penIvdHJlZS9tYXN0ZXIvZmVhdHVyZS1kZXRlY3RzKSkuIEp1c3QgbGlrZSB0aGUgb2ZmaWNhbCBkZXRlY3RzLCB0aGUgcmVzdWx0XG4gICAqIHdpbGwgYmUgYWRkZWQgb250byB0aGUgTW9kZXJuaXpyIG9iamVjdCwgYXMgd2VsbCBhcyBhbiBhcHByb3ByaWF0ZSBjbGFzc05hbWUgc2V0IG9uXG4gICAqIHRoZSBodG1sIGVsZW1lbnQgd2hlbiBjb25maWd1cmVkIHRvIGRvIHNvXG4gICAqXG4gICAqIEBtZW1iZXJvZiBNb2Rlcm5penJcbiAgICogQG5hbWUgTW9kZXJuaXpyLmFkZFRlc3RcbiAgICogQG9wdGlvbk5hbWUgTW9kZXJuaXpyLmFkZFRlc3QoKVxuICAgKiBAb3B0aW9uUHJvcCBhZGRUZXN0XG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqIEBmdW5jdGlvbiBhZGRUZXN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gZmVhdHVyZSAtIFRoZSBzdHJpbmcgbmFtZSBvZiB0aGUgZmVhdHVyZSBkZXRlY3QsIG9yIGFuXG4gICAqIG9iamVjdCBvZiBmZWF0dXJlIGRldGVjdCBuYW1lcyBhbmQgdGVzdFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufGJvb2xlYW59IHRlc3QgLSBGdW5jdGlvbiByZXR1cm5pbmcgdHJ1ZSBpZiBmZWF0dXJlIGlzIHN1cHBvcnRlZCxcbiAgICogZmFsc2UgaWYgbm90LiBPdGhlcndpc2UgYSBib29sZWFuIHJlcHJlc2VudGluZyB0aGUgcmVzdWx0cyBvZiBhIGZlYXR1cmUgZGV0ZWN0aW9uXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIFRoZSBtb3N0IGNvbW1vbiB3YXkgb2YgY3JlYXRpbmcgeW91ciBvd24gZmVhdHVyZSBkZXRlY3RzIGlzIGJ5IGNhbGxpbmdcbiAgICogYE1vZGVybml6ci5hZGRUZXN0YCB3aXRoIGEgc3RyaW5nIChwcmVmZXJhYmx5IGp1c3QgbG93ZXJjYXNlLCB3aXRob3V0IGFueVxuICAgKiBwdW5jdHVhdGlvbiksIGFuZCBhIGZ1bmN0aW9uIHlvdSB3YW50IGV4ZWN1dGVkIHRoYXQgd2lsbCByZXR1cm4gYSBib29sZWFuIHJlc3VsdFxuICAgKlxuICAgKiBgYGBqc1xuICAgKiBNb2Rlcm5penIuYWRkVGVzdCgnaXRzVHVlc2RheScsIGZ1bmN0aW9uKCkge1xuICAgKiAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgKiAgcmV0dXJuIGQuZ2V0RGF5KCkgPT09IDI7XG4gICAqIH0pO1xuICAgKiBgYGBcbiAgICpcbiAgICogV2hlbiB0aGUgYWJvdmUgaXMgcnVuLCBpdCB3aWxsIHNldCBNb2Rlcm5penIuaXRzdHVlc2RheSB0byBgdHJ1ZWAgd2hlbiBpdCBpcyB0dWVzZGF5LFxuICAgKiBhbmQgdG8gYGZhbHNlYCBldmVyeSBvdGhlciBkYXkgb2YgdGhlIHdlZWsuIE9uZSB0aGluZyB0byBub3RpY2UgaXMgdGhhdCB0aGUgbmFtZXMgb2ZcbiAgICogZmVhdHVyZSBkZXRlY3QgZnVuY3Rpb25zIGFyZSBhbHdheXMgbG93ZXJjYXNlZCB3aGVuIGFkZGVkIHRvIHRoZSBNb2Rlcm5penIgb2JqZWN0LiBUaGF0XG4gICAqIG1lYW5zIHRoYXQgYE1vZGVybml6ci5pdHNUdWVzZGF5YCB3aWxsIG5vdCBleGlzdCwgYnV0IGBNb2Rlcm5penIuaXRzdHVlc2RheWAgd2lsbC5cbiAgICpcbiAgICpcbiAgICogIFNpbmNlIHdlIG9ubHkgbG9vayBhdCB0aGUgcmV0dXJuZWQgdmFsdWUgZnJvbSBhbnkgZmVhdHVyZSBkZXRlY3Rpb24gZnVuY3Rpb24sXG4gICAqICB5b3UgZG8gbm90IG5lZWQgdG8gYWN0dWFsbHkgdXNlIGEgZnVuY3Rpb24uIEZvciBzaW1wbGUgZGV0ZWN0aW9ucywganVzdCBwYXNzaW5nXG4gICAqICBpbiBhIHN0YXRlbWVudCB0aGF0IHdpbGwgcmV0dXJuIGEgYm9vbGVhbiB2YWx1ZSB3b3JrcyBqdXN0IGZpbmUuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIE1vZGVybml6ci5hZGRUZXN0KCdoYXNKcXVlcnknLCAnalF1ZXJ5JyBpbiB3aW5kb3cpO1xuICAgKiBgYGBcbiAgICpcbiAgICogSnVzdCBsaWtlIGJlZm9yZSwgd2hlbiB0aGUgYWJvdmUgcnVucyBgTW9kZXJuaXpyLmhhc2pxdWVyeWAgd2lsbCBiZSB0cnVlIGlmXG4gICAqIGpRdWVyeSBoYXMgYmVlbiBpbmNsdWRlZCBvbiB0aGUgcGFnZS4gTm90IHVzaW5nIGEgZnVuY3Rpb24gc2F2ZXMgYSBzbWFsbCBhbW91bnRcbiAgICogb2Ygb3ZlcmhlYWQgZm9yIHRoZSBicm93c2VyLCBhcyB3ZWxsIGFzIG1ha2luZyB5b3VyIGNvZGUgbXVjaCBtb3JlIHJlYWRhYmxlLlxuICAgKlxuICAgKiBGaW5hbGx5LCB5b3UgYWxzbyBoYXZlIHRoZSBhYmlsaXR5IHRvIHBhc3MgaW4gYW4gb2JqZWN0IG9mIGZlYXR1cmUgbmFtZXMgYW5kXG4gICAqIHRoZWlyIHRlc3RzLiBUaGlzIGlzIGhhbmR5IGlmIHlvdSB3YW50IHRvIGFkZCBtdWx0aXBsZSBkZXRlY3Rpb25zIGluIG9uZSBnby5cbiAgICogVGhlIGtleXMgc2hvdWxkIGFsd2F5cyBiZSBhIHN0cmluZywgYW5kIHRoZSB2YWx1ZSBjYW4gYmUgZWl0aGVyIGEgYm9vbGVhbiBvclxuICAgKiBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBib29sZWFuLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiB2YXIgZGV0ZWN0cyA9IHtcbiAgICogICdoYXNqcXVlcnknOiAnalF1ZXJ5JyBpbiB3aW5kb3csXG4gICAqICAnaXRzdHVlc2RheSc6IGZ1bmN0aW9uKCkge1xuICAgKiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gICAqICAgIHJldHVybiBkLmdldERheSgpID09PSAyO1xuICAgKiAgfVxuICAgKiB9XG4gICAqXG4gICAqIE1vZGVybml6ci5hZGRUZXN0KGRldGVjdHMpO1xuICAgKiBgYGBcbiAgICpcbiAgICogVGhlcmUgaXMgcmVhbGx5IG5vIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgZmlyc3QgbWV0aG9kcyBhbmQgdGhpcyBvbmUsIGl0IGlzXG4gICAqIGp1c3QgYSBjb252ZW5pZW5jZSB0byBsZXQgeW91IHdyaXRlIG1vcmUgcmVhZGFibGUgY29kZS5cbiAgICovXG5cbiAgZnVuY3Rpb24gYWRkVGVzdChmZWF0dXJlLCB0ZXN0KSB7XG5cbiAgICBpZiAodHlwZW9mIGZlYXR1cmUgPT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBmZWF0dXJlKSB7XG4gICAgICAgIGlmIChoYXNPd25Qcm9wKGZlYXR1cmUsIGtleSkpIHtcbiAgICAgICAgICBhZGRUZXN0KGtleSwgZmVhdHVyZVsga2V5IF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcblxuICAgICAgZmVhdHVyZSA9IGZlYXR1cmUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHZhciBmZWF0dXJlTmFtZVNwbGl0ID0gZmVhdHVyZS5zcGxpdCgnLicpO1xuICAgICAgdmFyIGxhc3QgPSBNb2Rlcm5penJbZmVhdHVyZU5hbWVTcGxpdFswXV07XG5cbiAgICAgIC8vIEFnYWluLCB3ZSBkb24ndCBjaGVjayBmb3IgcGFyZW50IHRlc3QgZXhpc3RlbmNlLiBHZXQgdGhhdCByaWdodCwgdGhvdWdoLlxuICAgICAgaWYgKGZlYXR1cmVOYW1lU3BsaXQubGVuZ3RoID09IDIpIHtcbiAgICAgICAgbGFzdCA9IGxhc3RbZmVhdHVyZU5hbWVTcGxpdFsxXV07XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGFzdCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyB3ZSdyZSBnb2luZyB0byBxdWl0IGlmIHlvdSdyZSB0cnlpbmcgdG8gb3ZlcndyaXRlIGFuIGV4aXN0aW5nIHRlc3RcbiAgICAgICAgLy8gaWYgd2Ugd2VyZSB0byBhbGxvdyBpdCwgd2UnZCBkbyB0aGlzOlxuICAgICAgICAvLyAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCJcXFxcYihuby0pP1wiICsgZmVhdHVyZSArIFwiXFxcXGJcIik7XG4gICAgICAgIC8vICAgZG9jRWxlbWVudC5jbGFzc05hbWUgPSBkb2NFbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKCByZSwgJycgKTtcbiAgICAgICAgLy8gYnV0LCBubyBybHksIHN0dWZmICdlbS5cbiAgICAgICAgcmV0dXJuIE1vZGVybml6cjtcbiAgICAgIH1cblxuICAgICAgdGVzdCA9IHR5cGVvZiB0ZXN0ID09ICdmdW5jdGlvbicgPyB0ZXN0KCkgOiB0ZXN0O1xuXG4gICAgICAvLyBTZXQgdGhlIHZhbHVlICh0aGlzIGlzIHRoZSBtYWdpYywgcmlnaHQgaGVyZSkuXG4gICAgICBpZiAoZmVhdHVyZU5hbWVTcGxpdC5sZW5ndGggPT0gMSkge1xuICAgICAgICBNb2Rlcm5penJbZmVhdHVyZU5hbWVTcGxpdFswXV0gPSB0ZXN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2FzdCB0byBhIEJvb2xlYW4sIGlmIG5vdCBvbmUgYWxyZWFkeVxuICAgICAgICBpZiAoTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dICYmICEoTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dIGluc3RhbmNlb2YgQm9vbGVhbikpIHtcbiAgICAgICAgICBNb2Rlcm5penJbZmVhdHVyZU5hbWVTcGxpdFswXV0gPSBuZXcgQm9vbGVhbihNb2Rlcm5penJbZmVhdHVyZU5hbWVTcGxpdFswXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgTW9kZXJuaXpyW2ZlYXR1cmVOYW1lU3BsaXRbMF1dW2ZlYXR1cmVOYW1lU3BsaXRbMV1dID0gdGVzdDtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGEgc2luZ2xlIGNsYXNzIChlaXRoZXIgYGZlYXR1cmVgIG9yIGBuby1mZWF0dXJlYClcbiAgICAgIHNldENsYXNzZXMoWyghIXRlc3QgJiYgdGVzdCAhPSBmYWxzZSA/ICcnIDogJ25vLScpICsgZmVhdHVyZU5hbWVTcGxpdC5qb2luKCctJyldKTtcblxuICAgICAgLy8gVHJpZ2dlciB0aGUgZXZlbnRcbiAgICAgIE1vZGVybml6ci5fdHJpZ2dlcihmZWF0dXJlLCB0ZXN0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gTW9kZXJuaXpyOyAvLyBhbGxvdyBjaGFpbmluZy5cbiAgfVxuXG4gIC8vIEFmdGVyIGFsbCB0aGUgdGVzdHMgYXJlIHJ1biwgYWRkIHNlbGYgdG8gdGhlIE1vZGVybml6ciBwcm90b3R5cGVcbiAgTW9kZXJuaXpyLl9xLnB1c2goZnVuY3Rpb24oKSB7XG4gICAgTW9kZXJuaXpyUHJvdG8uYWRkVGVzdCA9IGFkZFRlc3Q7XG4gIH0pO1xuXG4gIFxuXG5cbiAgLyoqXG4gICAqIGNyZWF0ZUVsZW1lbnQgaXMgYSBjb252ZW5pZW5jZSB3cmFwcGVyIGFyb3VuZCBkb2N1bWVudC5jcmVhdGVFbGVtZW50LiBTaW5jZSB3ZVxuICAgKiB1c2UgY3JlYXRlRWxlbWVudCBhbGwgb3ZlciB0aGUgcGxhY2UsIHRoaXMgYWxsb3dzIGZvciAoc2xpZ2h0bHkpIHNtYWxsZXIgY29kZVxuICAgKiBhcyB3ZWxsIGFzIGFic3RyYWN0aW5nIGF3YXkgaXNzdWVzIHdpdGggY3JlYXRpbmcgZWxlbWVudHMgaW4gY29udGV4dHMgb3RoZXIgdGhhblxuICAgKiBIVE1MIGRvY3VtZW50cyAoZS5nLiBTVkcgZG9jdW1lbnRzKS5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqIEBmdW5jdGlvbiBjcmVhdGVFbGVtZW50XG4gICAqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxTVkdFbGVtZW50fSBBbiBIVE1MIG9yIFNWRyBlbGVtZW50XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoKSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50ICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBjYXNlIGluIElFNywgd2hlcmUgdGhlIHR5cGUgb2YgY3JlYXRlRWxlbWVudCBpcyBcIm9iamVjdFwiLlxuICAgICAgLy8gRm9yIHRoaXMgcmVhc29uLCB3ZSBjYW5ub3QgY2FsbCBhcHBseSgpIGFzIE9iamVjdCBpcyBub3QgYSBGdW5jdGlvbi5cbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGFyZ3VtZW50c1swXSk7XG4gICAgfSBlbHNlIGlmIChpc1NWRykge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUy5jYWxsKGRvY3VtZW50LCAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBhcmd1bWVudHNbMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudC5hcHBseShkb2N1bWVudCwgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICA7XG5cbiAgLyoqXG4gICAqIGdldEJvZHkgcmV0dXJucyB0aGUgYm9keSBvZiBhIGRvY3VtZW50LCBvciBhbiBlbGVtZW50IHRoYXQgY2FuIHN0YW5kIGluIGZvclxuICAgKiB0aGUgYm9keSBpZiBhIHJlYWwgYm9keSBkb2VzIG5vdCBleGlzdFxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIGdldEJvZHlcbiAgICogQHJldHVybnMge0hUTUxFbGVtZW50fFNWR0VsZW1lbnR9IFJldHVybnMgdGhlIHJlYWwgYm9keSBvZiBhIGRvY3VtZW50LCBvciBhblxuICAgKiBhcnRpZmljaWFsbHkgY3JlYXRlZCBlbGVtZW50IHRoYXQgc3RhbmRzIGluIGZvciB0aGUgYm9keVxuICAgKi9cblxuICBmdW5jdGlvbiBnZXRCb2R5KCkge1xuICAgIC8vIEFmdGVyIHBhZ2UgbG9hZCBpbmplY3RpbmcgYSBmYWtlIGJvZHkgZG9lc24ndCB3b3JrIHNvIGNoZWNrIGlmIGJvZHkgZXhpc3RzXG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5O1xuXG4gICAgaWYgKCFib2R5KSB7XG4gICAgICAvLyBDYW4ndCB1c2UgdGhlIHJlYWwgYm9keSBjcmVhdGUgYSBmYWtlIG9uZS5cbiAgICAgIGJvZHkgPSBjcmVhdGVFbGVtZW50KGlzU1ZHID8gJ3N2ZycgOiAnYm9keScpO1xuICAgICAgYm9keS5mYWtlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gYm9keTtcbiAgfVxuXG4gIDtcblxuICAvKipcbiAgICogaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMgaW5qZWN0cyBhbiBlbGVtZW50IHdpdGggc3R5bGUgZWxlbWVudCBhbmQgc29tZSBDU1MgcnVsZXNcbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqIEBmdW5jdGlvbiBpbmplY3RFbGVtZW50V2l0aFN0eWxlc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcnVsZSAtIFN0cmluZyByZXByZXNlbnRpbmcgYSBjc3MgcnVsZVxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayAtIEEgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIHRvIHRlc3QgdGhlIGluamVjdGVkIGVsZW1lbnRcbiAgICogQHBhcmFtIHtudW1iZXJ9IFtub2Rlc10gLSBBbiBpbnRlZ2VyIHJlcHJlc2VudGluZyB0aGUgbnVtYmVyIG9mIGFkZGl0aW9uYWwgbm9kZXMgeW91IHdhbnQgaW5qZWN0ZWRcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gW3Rlc3RuYW1lc10gLSBBbiBhcnJheSBvZiBzdHJpbmdzIHRoYXQgYXJlIHVzZWQgYXMgaWRzIGZvciB0aGUgYWRkaXRpb25hbCBub2Rlc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG5cbiAgZnVuY3Rpb24gaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMocnVsZSwgY2FsbGJhY2ssIG5vZGVzLCB0ZXN0bmFtZXMpIHtcbiAgICB2YXIgbW9kID0gJ21vZGVybml6cic7XG4gICAgdmFyIHN0eWxlO1xuICAgIHZhciByZXQ7XG4gICAgdmFyIG5vZGU7XG4gICAgdmFyIGRvY092ZXJmbG93O1xuICAgIHZhciBkaXYgPSBjcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB2YXIgYm9keSA9IGdldEJvZHkoKTtcblxuICAgIGlmIChwYXJzZUludChub2RlcywgMTApKSB7XG4gICAgICAvLyBJbiBvcmRlciBub3QgdG8gZ2l2ZSBmYWxzZSBwb3NpdGl2ZXMgd2UgY3JlYXRlIGEgbm9kZSBmb3IgZWFjaCB0ZXN0XG4gICAgICAvLyBUaGlzIGFsc28gYWxsb3dzIHRoZSBtZXRob2QgdG8gc2NhbGUgZm9yIHVuc3BlY2lmaWVkIHVzZXNcbiAgICAgIHdoaWxlIChub2Rlcy0tKSB7XG4gICAgICAgIG5vZGUgPSBjcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgbm9kZS5pZCA9IHRlc3RuYW1lcyA/IHRlc3RuYW1lc1tub2Rlc10gOiBtb2QgKyAobm9kZXMgKyAxKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN0eWxlID0gY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcbiAgICBzdHlsZS50eXBlID0gJ3RleHQvY3NzJztcbiAgICBzdHlsZS5pZCA9ICdzJyArIG1vZDtcblxuICAgIC8vIElFNiB3aWxsIGZhbHNlIHBvc2l0aXZlIG9uIHNvbWUgdGVzdHMgZHVlIHRvIHRoZSBzdHlsZSBlbGVtZW50IGluc2lkZSB0aGUgdGVzdCBkaXYgc29tZWhvdyBpbnRlcmZlcmluZyBvZmZzZXRIZWlnaHQsIHNvIGluc2VydCBpdCBpbnRvIGJvZHkgb3IgZmFrZWJvZHkuXG4gICAgLy8gT3BlcmEgd2lsbCBhY3QgYWxsIHF1aXJreSB3aGVuIGluamVjdGluZyBlbGVtZW50cyBpbiBkb2N1bWVudEVsZW1lbnQgd2hlbiBwYWdlIGlzIHNlcnZlZCBhcyB4bWwsIG5lZWRzIGZha2Vib2R5IHRvby4gIzI3MFxuICAgICghYm9keS5mYWtlID8gZGl2IDogYm9keSkuYXBwZW5kQ2hpbGQoc3R5bGUpO1xuICAgIGJvZHkuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSBydWxlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHlsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShydWxlKSk7XG4gICAgfVxuICAgIGRpdi5pZCA9IG1vZDtcblxuICAgIGlmIChib2R5LmZha2UpIHtcbiAgICAgIC8vYXZvaWQgY3Jhc2hpbmcgSUU4LCBpZiBiYWNrZ3JvdW5kIGltYWdlIGlzIHVzZWRcbiAgICAgIGJvZHkuc3R5bGUuYmFja2dyb3VuZCA9ICcnO1xuICAgICAgLy9TYWZhcmkgNS4xMy81LjEuNCBPU1ggc3RvcHMgbG9hZGluZyBpZiA6Oi13ZWJraXQtc2Nyb2xsYmFyIGlzIHVzZWQgYW5kIHNjcm9sbGJhcnMgYXJlIHZpc2libGVcbiAgICAgIGJvZHkuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgIGRvY092ZXJmbG93ID0gZG9jRWxlbWVudC5zdHlsZS5vdmVyZmxvdztcbiAgICAgIGRvY0VsZW1lbnQuc3R5bGUub3ZlcmZsb3cgPSAnaGlkZGVuJztcbiAgICAgIGRvY0VsZW1lbnQuYXBwZW5kQ2hpbGQoYm9keSk7XG4gICAgfVxuXG4gICAgcmV0ID0gY2FsbGJhY2soZGl2LCBydWxlKTtcbiAgICAvLyBJZiB0aGlzIGlzIGRvbmUgYWZ0ZXIgcGFnZSBsb2FkIHdlIGRvbid0IHdhbnQgdG8gcmVtb3ZlIHRoZSBib2R5IHNvIGNoZWNrIGlmIGJvZHkgZXhpc3RzXG4gICAgaWYgKGJvZHkuZmFrZSkge1xuICAgICAgYm9keS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGJvZHkpO1xuICAgICAgZG9jRWxlbWVudC5zdHlsZS5vdmVyZmxvdyA9IGRvY092ZXJmbG93O1xuICAgICAgLy8gVHJpZ2dlciBsYXlvdXQgc28ga2luZXRpYyBzY3JvbGxpbmcgaXNuJ3QgZGlzYWJsZWQgaW4gaU9TNitcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZVxuICAgICAgZG9jRWxlbWVudC5vZmZzZXRIZWlnaHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRpdi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGRpdik7XG4gICAgfVxuXG4gICAgcmV0dXJuICEhcmV0O1xuXG4gIH1cblxuICA7XG5cbiAgLyoqXG4gICAqIE1vZGVybml6ci5tcSB0ZXN0cyBhIGdpdmVuIG1lZGlhIHF1ZXJ5LCBsaXZlIGFnYWluc3QgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHdpbmRvd1xuICAgKiBhZGFwdGVkIGZyb20gbWF0Y2hNZWRpYSBwb2x5ZmlsbCBieSBTY290dCBKZWhsIGFuZCBQYXVsIElyaXNoXG4gICAqIGdpc3QuZ2l0aHViLmNvbS83ODY3NjhcbiAgICpcbiAgICogQG1lbWJlcm9mIE1vZGVybml6clxuICAgKiBAbmFtZSBNb2Rlcm5penIubXFcbiAgICogQG9wdGlvbk5hbWUgTW9kZXJuaXpyLm1xKClcbiAgICogQG9wdGlvblByb3AgbXFcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICogQGZ1bmN0aW9uIG1xXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBtcSAtIFN0cmluZyBvZiB0aGUgbWVkaWEgcXVlcnkgd2Ugd2FudCB0byB0ZXN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAZXhhbXBsZVxuICAgKiBNb2Rlcm5penIubXEgYWxsb3dzIGZvciB5b3UgdG8gcHJvZ3JhbW1hdGljYWxseSBjaGVjayBpZiB0aGUgY3VycmVudCBicm93c2VyXG4gICAqIHdpbmRvdyBzdGF0ZSBtYXRjaGVzIGEgbWVkaWEgcXVlcnkuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqICB2YXIgcXVlcnkgPSBNb2Rlcm5penIubXEoJyhtaW4td2lkdGg6IDkwMHB4KScpO1xuICAgKlxuICAgKiAgaWYgKHF1ZXJ5KSB7XG4gICAqICAgIC8vIHRoZSBicm93c2VyIHdpbmRvdyBpcyBsYXJnZXIgdGhhbiA5MDBweFxuICAgKiAgfVxuICAgKiBgYGBcbiAgICpcbiAgICogT25seSB2YWxpZCBtZWRpYSBxdWVyaWVzIGFyZSBzdXBwb3J0ZWQsIHRoZXJlZm9yZSB5b3UgbXVzdCBhbHdheXMgaW5jbHVkZSB2YWx1ZXNcbiAgICogd2l0aCB5b3VyIG1lZGlhIHF1ZXJ5XG4gICAqXG4gICAqIGBgYGpzXG4gICAqIC8vIGdvb2RcbiAgICogIE1vZGVybml6ci5tcSgnKG1pbi13aWR0aDogOTAwcHgpJyk7XG4gICAqXG4gICAqIC8vIGJhZFxuICAgKiAgTW9kZXJuaXpyLm1xKCdtaW4td2lkdGgnKTtcbiAgICogYGBgXG4gICAqXG4gICAqIElmIHlvdSB3b3VsZCBqdXN0IGxpa2UgdG8gdGVzdCB0aGF0IG1lZGlhIHF1ZXJpZXMgYXJlIHN1cHBvcnRlZCBpbiBnZW5lcmFsLCB1c2VcbiAgICpcbiAgICogYGBganNcbiAgICogIE1vZGVybml6ci5tcSgnb25seSBhbGwnKTsgLy8gdHJ1ZSBpZiBNUSBhcmUgc3VwcG9ydGVkLCBmYWxzZSBpZiBub3RcbiAgICogYGBgXG4gICAqXG4gICAqXG4gICAqIE5vdGUgdGhhdCBpZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IG1lZGlhIHF1ZXJpZXMgKGUuZy4gb2xkIElFKSBtcSB3aWxsXG4gICAqIGFsd2F5cyByZXR1cm4gZmFsc2UuXG4gICAqL1xuXG4gIHZhciBtcSA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgbWF0Y2hNZWRpYSA9IHdpbmRvdy5tYXRjaE1lZGlhIHx8IHdpbmRvdy5tc01hdGNoTWVkaWE7XG4gICAgaWYgKG1hdGNoTWVkaWEpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihtcSkge1xuICAgICAgICB2YXIgbXFsID0gbWF0Y2hNZWRpYShtcSk7XG4gICAgICAgIHJldHVybiBtcWwgJiYgbXFsLm1hdGNoZXMgfHwgZmFsc2U7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbihtcSkge1xuICAgICAgdmFyIGJvb2wgPSBmYWxzZTtcblxuICAgICAgaW5qZWN0RWxlbWVudFdpdGhTdHlsZXMoJ0BtZWRpYSAnICsgbXEgKyAnIHsgI21vZGVybml6ciB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgfSB9JywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBib29sID0gKHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlID9cbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKSA6XG4gICAgICAgICAgICAgICAgbm9kZS5jdXJyZW50U3R5bGUpLnBvc2l0aW9uID09ICdhYnNvbHV0ZSc7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGJvb2w7XG4gICAgfTtcbiAgfSkoKTtcblxuXG4gIE1vZGVybml6clByb3RvLm1xID0gbXE7XG5cbiAgXG5cbi8qKlxuICAqIEBvcHRpb25OYW1lIGh0bWw1cHJpbnRzaGl2XG4gICogQG9wdGlvblByb3AgaHRtbDVwcmludHNoaXZcbiAgKi9cblxuICAvLyBUYWtlIHRoZSBodG1sNSB2YXJpYWJsZSBvdXQgb2YgdGhlIGh0bWw1c2hpdiBzY29wZSBzbyB3ZSBjYW4gcmV0dXJuIGl0LlxuICB2YXIgaHRtbDU7XG4gIGlmICghaXNTVkcpIHtcblxuICAgIC8qKlxuICAgICAqIEBwcmVzZXJ2ZSBIVE1MNSBTaGl2IDMuNy4zIHwgQGFmYXJrYXMgQGpkYWx0b24gQGpvbl9uZWFsIEByZW0gfCBNSVQvR1BMMiBMaWNlbnNlZFxuICAgICAqL1xuICAgIDsoZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCkge1xuICAgICAgLyoqIHZlcnNpb24gKi9cbiAgICAgIHZhciB2ZXJzaW9uID0gJzMuNy4zJztcblxuICAgICAgLyoqIFByZXNldCBvcHRpb25zICovXG4gICAgICB2YXIgb3B0aW9ucyA9IHdpbmRvdy5odG1sNSB8fCB7fTtcblxuICAgICAgLyoqIFVzZWQgdG8gc2tpcCBwcm9ibGVtIGVsZW1lbnRzICovXG4gICAgICB2YXIgcmVTa2lwID0gL148fF4oPzpidXR0b258bWFwfHNlbGVjdHx0ZXh0YXJlYXxvYmplY3R8aWZyYW1lfG9wdGlvbnxvcHRncm91cCkkL2k7XG5cbiAgICAgIC8qKiBOb3QgYWxsIGVsZW1lbnRzIGNhbiBiZSBjbG9uZWQgaW4gSUUgKiovXG4gICAgICB2YXIgc2F2ZUNsb25lcyA9IC9eKD86YXxifGNvZGV8ZGl2fGZpZWxkc2V0fGgxfGgyfGgzfGg0fGg1fGg2fGl8bGFiZWx8bGl8b2x8cHxxfHNwYW58c3Ryb25nfHN0eWxlfHRhYmxlfHRib2R5fHRkfHRofHRyfHVsKSQvaTtcblxuICAgICAgLyoqIERldGVjdCB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIGRlZmF1bHQgaHRtbDUgc3R5bGVzICovXG4gICAgICB2YXIgc3VwcG9ydHNIdG1sNVN0eWxlcztcblxuICAgICAgLyoqIE5hbWUgb2YgdGhlIGV4cGFuZG8sIHRvIHdvcmsgd2l0aCBtdWx0aXBsZSBkb2N1bWVudHMgb3IgdG8gcmUtc2hpdiBvbmUgZG9jdW1lbnQgKi9cbiAgICAgIHZhciBleHBhbmRvID0gJ19odG1sNXNoaXYnO1xuXG4gICAgICAvKiogVGhlIGlkIGZvciB0aGUgdGhlIGRvY3VtZW50cyBleHBhbmRvICovXG4gICAgICB2YXIgZXhwYW5JRCA9IDA7XG5cbiAgICAgIC8qKiBDYWNoZWQgZGF0YSBmb3IgZWFjaCBkb2N1bWVudCAqL1xuICAgICAgdmFyIGV4cGFuZG9EYXRhID0ge307XG5cbiAgICAgIC8qKiBEZXRlY3Qgd2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyB1bmtub3duIGVsZW1lbnRzICovXG4gICAgICB2YXIgc3VwcG9ydHNVbmtub3duRWxlbWVudHM7XG5cbiAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICAgICAgICBhLmlubmVySFRNTCA9ICc8eHl6PjwveHl6Pic7XG4gICAgICAgICAgLy9pZiB0aGUgaGlkZGVuIHByb3BlcnR5IGlzIGltcGxlbWVudGVkIHdlIGNhbiBhc3N1bWUsIHRoYXQgdGhlIGJyb3dzZXIgc3VwcG9ydHMgYmFzaWMgSFRNTDUgU3R5bGVzXG4gICAgICAgICAgc3VwcG9ydHNIdG1sNVN0eWxlcyA9ICgnaGlkZGVuJyBpbiBhKTtcblxuICAgICAgICAgIHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzID0gYS5jaGlsZE5vZGVzLmxlbmd0aCA9PSAxIHx8IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIGFzc2lnbiBhIGZhbHNlIHBvc2l0aXZlIGlmIHVuYWJsZSB0byBzaGl2XG4gICAgICAgICAgICAoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCkoJ2EnKTtcbiAgICAgICAgICAgIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgdHlwZW9mIGZyYWcuY2xvbmVOb2RlID09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIGZyYWcuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCA9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICAgICAgICAgIHR5cGVvZiBmcmFnLmNyZWF0ZUVsZW1lbnQgPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSgpKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgLy8gYXNzaWduIGEgZmFsc2UgcG9zaXRpdmUgaWYgZGV0ZWN0aW9uIGZhaWxzID0+IHVuYWJsZSB0byBzaGl2XG4gICAgICAgICAgc3VwcG9ydHNIdG1sNVN0eWxlcyA9IHRydWU7XG4gICAgICAgICAgc3VwcG9ydHNVbmtub3duRWxlbWVudHMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgIH0oKSk7XG5cbiAgICAgIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gICAgICAvKipcbiAgICAgICAqIENyZWF0ZXMgYSBzdHlsZSBzaGVldCB3aXRoIHRoZSBnaXZlbiBDU1MgdGV4dCBhbmQgYWRkcyBpdCB0byB0aGUgZG9jdW1lbnQuXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQuXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzVGV4dCBUaGUgQ1NTIHRleHQuXG4gICAgICAgKiBAcmV0dXJucyB7U3R5bGVTaGVldH0gVGhlIHN0eWxlIGVsZW1lbnQuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGFkZFN0eWxlU2hlZXQob3duZXJEb2N1bWVudCwgY3NzVGV4dCkge1xuICAgICAgICB2YXIgcCA9IG93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpLFxuICAgICAgICAgIHBhcmVudCA9IG93bmVyRG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXSB8fCBvd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICAgICAgICBwLmlubmVySFRNTCA9ICd4PHN0eWxlPicgKyBjc3NUZXh0ICsgJzwvc3R5bGU+JztcbiAgICAgICAgcmV0dXJuIHBhcmVudC5pbnNlcnRCZWZvcmUocC5sYXN0Q2hpbGQsIHBhcmVudC5maXJzdENoaWxkKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiBgaHRtbDUuZWxlbWVudHNgIGFzIGFuIGFycmF5LlxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEByZXR1cm5zIHtBcnJheX0gQW4gYXJyYXkgb2Ygc2hpdmVkIGVsZW1lbnQgbm9kZSBuYW1lcy5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gZ2V0RWxlbWVudHMoKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGh0bWw1LmVsZW1lbnRzO1xuICAgICAgICByZXR1cm4gdHlwZW9mIGVsZW1lbnRzID09ICdzdHJpbmcnID8gZWxlbWVudHMuc3BsaXQoJyAnKSA6IGVsZW1lbnRzO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIEV4dGVuZHMgdGhlIGJ1aWx0LWluIGxpc3Qgb2YgaHRtbDUgZWxlbWVudHNcbiAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG5ld0VsZW1lbnRzIHdoaXRlc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb3IgYXJyYXkgb2YgbmV3IGVsZW1lbnQgbmFtZXMgdG8gc2hpdlxuICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgY29udGV4dCBkb2N1bWVudC5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gYWRkRWxlbWVudHMobmV3RWxlbWVudHMsIG93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gaHRtbDUuZWxlbWVudHM7XG4gICAgICAgIGlmKHR5cGVvZiBlbGVtZW50cyAhPSAnc3RyaW5nJyl7XG4gICAgICAgICAgZWxlbWVudHMgPSBlbGVtZW50cy5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIG5ld0VsZW1lbnRzICE9ICdzdHJpbmcnKXtcbiAgICAgICAgICBuZXdFbGVtZW50cyA9IG5ld0VsZW1lbnRzLmpvaW4oJyAnKTtcbiAgICAgICAgfVxuICAgICAgICBodG1sNS5lbGVtZW50cyA9IGVsZW1lbnRzICsnICcrIG5ld0VsZW1lbnRzO1xuICAgICAgICBzaGl2RG9jdW1lbnQob3duZXJEb2N1bWVudCk7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgZGF0YSBhc3NvY2lhdGVkIHRvIHRoZSBnaXZlbiBkb2N1bWVudFxuICAgICAgICogQHByaXZhdGVcbiAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGRvY3VtZW50LlxuICAgICAgICogQHJldHVybnMge09iamVjdH0gQW4gb2JqZWN0IG9mIGRhdGEuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBleHBhbmRvRGF0YVtvd25lckRvY3VtZW50W2V4cGFuZG9dXTtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICAgIGV4cGFuSUQrKztcbiAgICAgICAgICBvd25lckRvY3VtZW50W2V4cGFuZG9dID0gZXhwYW5JRDtcbiAgICAgICAgICBleHBhbmRvRGF0YVtleHBhbklEXSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogcmV0dXJucyBhIHNoaXZlZCBlbGVtZW50IGZvciB0aGUgZ2l2ZW4gbm9kZU5hbWUgYW5kIGRvY3VtZW50XG4gICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAqIEBwYXJhbSB7U3RyaW5nfSBub2RlTmFtZSBuYW1lIG9mIHRoZSBlbGVtZW50XG4gICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fSBvd25lckRvY3VtZW50IFRoZSBjb250ZXh0IGRvY3VtZW50LlxuICAgICAgICogQHJldHVybnMge09iamVjdH0gVGhlIHNoaXZlZCBlbGVtZW50LlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KG5vZGVOYW1lLCBvd25lckRvY3VtZW50LCBkYXRhKXtcbiAgICAgICAgaWYgKCFvd25lckRvY3VtZW50KSB7XG4gICAgICAgICAgb3duZXJEb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmKHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzKXtcbiAgICAgICAgICByZXR1cm4gb3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgICBkYXRhID0gZ2V0RXhwYW5kb0RhdGEob3duZXJEb2N1bWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgaWYgKGRhdGEuY2FjaGVbbm9kZU5hbWVdKSB7XG4gICAgICAgICAgbm9kZSA9IGRhdGEuY2FjaGVbbm9kZU5hbWVdLmNsb25lTm9kZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHNhdmVDbG9uZXMudGVzdChub2RlTmFtZSkpIHtcbiAgICAgICAgICBub2RlID0gKGRhdGEuY2FjaGVbbm9kZU5hbWVdID0gZGF0YS5jcmVhdGVFbGVtKG5vZGVOYW1lKSkuY2xvbmVOb2RlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZSA9IGRhdGEuY3JlYXRlRWxlbShub2RlTmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBhZGRpbmcgc29tZSBlbGVtZW50cyB0byBmcmFnbWVudHMgaW4gSUUgPCA5IGJlY2F1c2VcbiAgICAgICAgLy8gKiBBdHRyaWJ1dGVzIGxpa2UgYG5hbWVgIG9yIGB0eXBlYCBjYW5ub3QgYmUgc2V0L2NoYW5nZWQgb25jZSBhbiBlbGVtZW50XG4gICAgICAgIC8vICAgaXMgaW5zZXJ0ZWQgaW50byBhIGRvY3VtZW50L2ZyYWdtZW50XG4gICAgICAgIC8vICogTGluayBlbGVtZW50cyB3aXRoIGBzcmNgIGF0dHJpYnV0ZXMgdGhhdCBhcmUgaW5hY2Nlc3NpYmxlLCBhcyB3aXRoXG4gICAgICAgIC8vICAgYSA0MDMgcmVzcG9uc2UsIHdpbGwgY2F1c2UgdGhlIHRhYi93aW5kb3cgdG8gY3Jhc2hcbiAgICAgICAgLy8gKiBTY3JpcHQgZWxlbWVudHMgYXBwZW5kZWQgdG8gZnJhZ21lbnRzIHdpbGwgZXhlY3V0ZSB3aGVuIHRoZWlyIGBzcmNgXG4gICAgICAgIC8vICAgb3IgYHRleHRgIHByb3BlcnR5IGlzIHNldFxuICAgICAgICByZXR1cm4gbm9kZS5jYW5IYXZlQ2hpbGRyZW4gJiYgIXJlU2tpcC50ZXN0KG5vZGVOYW1lKSAmJiAhbm9kZS50YWdVcm4gPyBkYXRhLmZyYWcuYXBwZW5kQ2hpbGQobm9kZSkgOiBub2RlO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIHJldHVybnMgYSBzaGl2ZWQgRG9jdW1lbnRGcmFnbWVudCBmb3IgdGhlIGdpdmVuIGRvY3VtZW50XG4gICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGNvbnRleHQgZG9jdW1lbnQuXG4gICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgc2hpdmVkIERvY3VtZW50RnJhZ21lbnQuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZURvY3VtZW50RnJhZ21lbnQob3duZXJEb2N1bWVudCwgZGF0YSl7XG4gICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xuICAgICAgICAgIG93bmVyRG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZihzdXBwb3J0c1Vua25vd25FbGVtZW50cyl7XG4gICAgICAgICAgcmV0dXJuIG93bmVyRG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIGRhdGEgPSBkYXRhIHx8IGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpO1xuICAgICAgICB2YXIgY2xvbmUgPSBkYXRhLmZyYWcuY2xvbmVOb2RlKCksXG4gICAgICAgICAgaSA9IDAsXG4gICAgICAgICAgZWxlbXMgPSBnZXRFbGVtZW50cygpLFxuICAgICAgICAgIGwgPSBlbGVtcy5sZW5ndGg7XG4gICAgICAgIGZvcig7aTxsO2krKyl7XG4gICAgICAgICAgY2xvbmUuY3JlYXRlRWxlbWVudChlbGVtc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNsb25lO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNoaXZzIHRoZSBgY3JlYXRlRWxlbWVudGAgYW5kIGBjcmVhdGVEb2N1bWVudEZyYWdtZW50YCBtZXRob2RzIG9mIHRoZSBkb2N1bWVudC5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAcGFyYW0ge0RvY3VtZW50fERvY3VtZW50RnJhZ21lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGRvY3VtZW50LlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGEgb2YgdGhlIGRvY3VtZW50LlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBzaGl2TWV0aG9kcyhvd25lckRvY3VtZW50LCBkYXRhKSB7XG4gICAgICAgIGlmICghZGF0YS5jYWNoZSkge1xuICAgICAgICAgIGRhdGEuY2FjaGUgPSB7fTtcbiAgICAgICAgICBkYXRhLmNyZWF0ZUVsZW0gPSBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQ7XG4gICAgICAgICAgZGF0YS5jcmVhdGVGcmFnID0gb3duZXJEb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50O1xuICAgICAgICAgIGRhdGEuZnJhZyA9IGRhdGEuY3JlYXRlRnJhZygpO1xuICAgICAgICB9XG5cblxuICAgICAgICBvd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbihub2RlTmFtZSkge1xuICAgICAgICAgIC8vYWJvcnQgc2hpdlxuICAgICAgICAgIGlmICghaHRtbDUuc2hpdk1ldGhvZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmNyZWF0ZUVsZW0obm9kZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gY3JlYXRlRWxlbWVudChub2RlTmFtZSwgb3duZXJEb2N1bWVudCwgZGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgb3duZXJEb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50ID0gRnVuY3Rpb24oJ2gsZicsICdyZXR1cm4gZnVuY3Rpb24oKXsnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhciBuPWYuY2xvbmVOb2RlKCksYz1uLmNyZWF0ZUVsZW1lbnQ7JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdoLnNoaXZNZXRob2RzJiYoJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHVucm9sbCB0aGUgYGNyZWF0ZUVsZW1lbnRgIGNhbGxzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldEVsZW1lbnRzKCkuam9pbigpLnJlcGxhY2UoL1tcXHdcXC06XSsvZywgZnVuY3Rpb24obm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmNyZWF0ZUVsZW0obm9kZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEuZnJhZy5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ2MoXCInICsgbm9kZU5hbWUgKyAnXCIpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgK1xuICAgICAgICAgICcpO3JldHVybiBufSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKGh0bWw1LCBkYXRhLmZyYWcpO1xuICAgICAgfVxuXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgLyoqXG4gICAgICAgKiBTaGl2cyB0aGUgZ2l2ZW4gZG9jdW1lbnQuXG4gICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAqIEBwYXJhbSB7RG9jdW1lbnR9IG93bmVyRG9jdW1lbnQgVGhlIGRvY3VtZW50IHRvIHNoaXYuXG4gICAgICAgKiBAcmV0dXJucyB7RG9jdW1lbnR9IFRoZSBzaGl2ZWQgZG9jdW1lbnQuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHNoaXZEb2N1bWVudChvd25lckRvY3VtZW50KSB7XG4gICAgICAgIGlmICghb3duZXJEb2N1bWVudCkge1xuICAgICAgICAgIG93bmVyRG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YSA9IGdldEV4cGFuZG9EYXRhKG93bmVyRG9jdW1lbnQpO1xuXG4gICAgICAgIGlmIChodG1sNS5zaGl2Q1NTICYmICFzdXBwb3J0c0h0bWw1U3R5bGVzICYmICFkYXRhLmhhc0NTUykge1xuICAgICAgICAgIGRhdGEuaGFzQ1NTID0gISFhZGRTdHlsZVNoZWV0KG93bmVyRG9jdW1lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29ycmVjdHMgYmxvY2sgZGlzcGxheSBub3QgZGVmaW5lZCBpbiBJRTYvNy84LzlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJ0aWNsZSxhc2lkZSxkaWFsb2csZmlnY2FwdGlvbixmaWd1cmUsZm9vdGVyLGhlYWRlcixoZ3JvdXAsbWFpbixuYXYsc2VjdGlvbntkaXNwbGF5OmJsb2NrfScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFkZHMgc3R5bGluZyBub3QgcHJlc2VudCBpbiBJRTYvNy84LzlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWFya3tiYWNrZ3JvdW5kOiNGRjA7Y29sb3I6IzAwMH0nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBoaWRlcyBub24tcmVuZGVyZWQgZWxlbWVudHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGVtcGxhdGV7ZGlzcGxheTpub25lfSdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzdXBwb3J0c1Vua25vd25FbGVtZW50cykge1xuICAgICAgICAgIHNoaXZNZXRob2RzKG93bmVyRG9jdW1lbnQsIGRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvd25lckRvY3VtZW50O1xuICAgICAgfVxuXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgLyoqXG4gICAgICAgKiBUaGUgYGh0bWw1YCBvYmplY3QgaXMgZXhwb3NlZCBzbyB0aGF0IG1vcmUgZWxlbWVudHMgY2FuIGJlIHNoaXZlZCBhbmRcbiAgICAgICAqIGV4aXN0aW5nIHNoaXZpbmcgY2FuIGJlIGRldGVjdGVkIG9uIGlmcmFtZXMuXG4gICAgICAgKiBAdHlwZSBPYmplY3RcbiAgICAgICAqIEBleGFtcGxlXG4gICAgICAgKlxuICAgICAgICogLy8gb3B0aW9ucyBjYW4gYmUgY2hhbmdlZCBiZWZvcmUgdGhlIHNjcmlwdCBpcyBpbmNsdWRlZFxuICAgICAgICogaHRtbDUgPSB7ICdlbGVtZW50cyc6ICdtYXJrIHNlY3Rpb24nLCAnc2hpdkNTUyc6IGZhbHNlLCAnc2hpdk1ldGhvZHMnOiBmYWxzZSB9O1xuICAgICAgICovXG4gICAgICB2YXIgaHRtbDUgPSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFuIGFycmF5IG9yIHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgb2Ygbm9kZSBuYW1lcyBvZiB0aGUgZWxlbWVudHMgdG8gc2hpdi5cbiAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAqIEB0eXBlIEFycmF5fFN0cmluZ1xuICAgICAgICAgKi9cbiAgICAgICAgJ2VsZW1lbnRzJzogb3B0aW9ucy5lbGVtZW50cyB8fCAnYWJiciBhcnRpY2xlIGFzaWRlIGF1ZGlvIGJkaSBjYW52YXMgZGF0YSBkYXRhbGlzdCBkZXRhaWxzIGRpYWxvZyBmaWdjYXB0aW9uIGZpZ3VyZSBmb290ZXIgaGVhZGVyIGhncm91cCBtYWluIG1hcmsgbWV0ZXIgbmF2IG91dHB1dCBwaWN0dXJlIHByb2dyZXNzIHNlY3Rpb24gc3VtbWFyeSB0ZW1wbGF0ZSB0aW1lIHZpZGVvJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogY3VycmVudCB2ZXJzaW9uIG9mIGh0bWw1c2hpdlxuICAgICAgICAgKi9cbiAgICAgICAgJ3ZlcnNpb24nOiB2ZXJzaW9uLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCB0aGUgSFRNTDUgc3R5bGUgc2hlZXQgc2hvdWxkIGJlIGluc2VydGVkLlxuICAgICAgICAgKiBAbWVtYmVyT2YgaHRtbDVcbiAgICAgICAgICogQHR5cGUgQm9vbGVhblxuICAgICAgICAgKi9cbiAgICAgICAgJ3NoaXZDU1MnOiAob3B0aW9ucy5zaGl2Q1NTICE9PSBmYWxzZSksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElzIGVxdWFsIHRvIHRydWUgaWYgYSBicm93c2VyIHN1cHBvcnRzIGNyZWF0aW5nIHVua25vd24vSFRNTDUgZWxlbWVudHNcbiAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgICdzdXBwb3J0c1Vua25vd25FbGVtZW50cyc6IHN1cHBvcnRzVW5rbm93bkVsZW1lbnRzLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBIGZsYWcgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZG9jdW1lbnQncyBgY3JlYXRlRWxlbWVudGAgYW5kIGBjcmVhdGVEb2N1bWVudEZyYWdtZW50YFxuICAgICAgICAgKiBtZXRob2RzIHNob3VsZCBiZSBvdmVyd3JpdHRlbi5cbiAgICAgICAgICogQG1lbWJlck9mIGh0bWw1XG4gICAgICAgICAqIEB0eXBlIEJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgICdzaGl2TWV0aG9kcyc6IChvcHRpb25zLnNoaXZNZXRob2RzICE9PSBmYWxzZSksXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEEgc3RyaW5nIHRvIGRlc2NyaWJlIHRoZSB0eXBlIG9mIGBodG1sNWAgb2JqZWN0IChcImRlZmF1bHRcIiBvciBcImRlZmF1bHQgcHJpbnRcIikuXG4gICAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICAgKiBAdHlwZSBTdHJpbmdcbiAgICAgICAgICovXG4gICAgICAgICd0eXBlJzogJ2RlZmF1bHQnLFxuXG4gICAgICAgIC8vIHNoaXZzIHRoZSBkb2N1bWVudCBhY2NvcmRpbmcgdG8gdGhlIHNwZWNpZmllZCBgaHRtbDVgIG9iamVjdCBvcHRpb25zXG4gICAgICAgICdzaGl2RG9jdW1lbnQnOiBzaGl2RG9jdW1lbnQsXG5cbiAgICAgICAgLy9jcmVhdGVzIGEgc2hpdmVkIGVsZW1lbnRcbiAgICAgICAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcblxuICAgICAgICAvL2NyZWF0ZXMgYSBzaGl2ZWQgZG9jdW1lbnRGcmFnbWVudFxuICAgICAgICBjcmVhdGVEb2N1bWVudEZyYWdtZW50OiBjcmVhdGVEb2N1bWVudEZyYWdtZW50LFxuXG4gICAgICAgIC8vZXh0ZW5kcyBsaXN0IG9mIGVsZW1lbnRzXG4gICAgICAgIGFkZEVsZW1lbnRzOiBhZGRFbGVtZW50c1xuICAgICAgfTtcblxuICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgIC8vIGV4cG9zZSBodG1sNVxuICAgICAgd2luZG93Lmh0bWw1ID0gaHRtbDU7XG5cbiAgICAgIC8vIHNoaXYgdGhlIGRvY3VtZW50XG4gICAgICBzaGl2RG9jdW1lbnQoZG9jdW1lbnQpO1xuXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUHJpbnQgU2hpdiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgLyoqIFVzZWQgdG8gZmlsdGVyIG1lZGlhIHR5cGVzICovXG4gICAgICB2YXIgcmVNZWRpYSA9IC9eJHxcXGIoPzphbGx8cHJpbnQpXFxiLztcblxuICAgICAgLyoqIFVzZWQgdG8gbmFtZXNwYWNlIHByaW50YWJsZSBlbGVtZW50cyAqL1xuICAgICAgdmFyIHNoaXZOYW1lc3BhY2UgPSAnaHRtbDVzaGl2JztcblxuICAgICAgLyoqIERldGVjdCB3aGV0aGVyIHRoZSBicm93c2VyIHN1cHBvcnRzIHNoaXZhYmxlIHN0eWxlIHNoZWV0cyAqL1xuICAgICAgdmFyIHN1cHBvcnRzU2hpdmFibGVTaGVldHMgPSAhc3VwcG9ydHNVbmtub3duRWxlbWVudHMgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBhc3NpZ24gYSBmYWxzZSBuZWdhdGl2ZSBpZiB1bmFibGUgdG8gc2hpdlxuICAgICAgICB2YXIgZG9jRWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiAhKFxuICAgICAgICAgIHR5cGVvZiBkb2N1bWVudC5uYW1lc3BhY2VzID09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICAgICB0eXBlb2YgZG9jdW1lbnQucGFyZW50V2luZG93ID09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICAgICB0eXBlb2YgZG9jRWwuYXBwbHlFbGVtZW50ID09ICd1bmRlZmluZWQnIHx8XG4gICAgICAgICAgICB0eXBlb2YgZG9jRWwucmVtb3ZlTm9kZSA9PSAndW5kZWZpbmVkJyB8fFxuICAgICAgICAgICAgdHlwZW9mIHdpbmRvdy5hdHRhY2hFdmVudCA9PSAndW5kZWZpbmVkJ1xuICAgICAgICApO1xuICAgICAgfSgpKTtcblxuICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgIC8qKlxuICAgICAgICogV3JhcHMgYWxsIEhUTUw1IGVsZW1lbnRzIGluIHRoZSBnaXZlbiBkb2N1bWVudCB3aXRoIHByaW50YWJsZSBlbGVtZW50cy5cbiAgICAgICAqIChlZy4gdGhlIFwiaGVhZGVyXCIgZWxlbWVudCBpcyB3cmFwcGVkIHdpdGggdGhlIFwiaHRtbDVzaGl2OmhlYWRlclwiIGVsZW1lbnQpXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQuXG4gICAgICAgKiBAcmV0dXJucyB7QXJyYXl9IEFuIGFycmF5IHdyYXBwZXJzIGFkZGVkLlxuICAgICAgICovXG4gICAgICBmdW5jdGlvbiBhZGRXcmFwcGVycyhvd25lckRvY3VtZW50KSB7XG4gICAgICAgIHZhciBub2RlLFxuICAgICAgICAgIG5vZGVzID0gb3duZXJEb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpLFxuICAgICAgICAgIGluZGV4ID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgIHJlRWxlbWVudHMgPSBSZWdFeHAoJ14oPzonICsgZ2V0RWxlbWVudHMoKS5qb2luKCd8JykgKyAnKSQnLCAnaScpLFxuICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgbm9kZSA9IG5vZGVzW2luZGV4XTtcbiAgICAgICAgICBpZiAocmVFbGVtZW50cy50ZXN0KG5vZGUubm9kZU5hbWUpKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChub2RlLmFwcGx5RWxlbWVudChjcmVhdGVXcmFwcGVyKG5vZGUpKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG5cbiAgICAgIC8qKlxuICAgICAgICogQ3JlYXRlcyBhIHByaW50YWJsZSB3cmFwcGVyIGZvciB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQuXG4gICAgICAgKiBAcmV0dXJucyB7RWxlbWVudH0gVGhlIHdyYXBwZXIuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoZWxlbWVudCkge1xuICAgICAgICB2YXIgbm9kZSxcbiAgICAgICAgICBub2RlcyA9IGVsZW1lbnQuYXR0cmlidXRlcyxcbiAgICAgICAgICBpbmRleCA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICB3cmFwcGVyID0gZWxlbWVudC5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoc2hpdk5hbWVzcGFjZSArICc6JyArIGVsZW1lbnQubm9kZU5hbWUpO1xuXG4gICAgICAgIC8vIGNvcHkgZWxlbWVudCBhdHRyaWJ1dGVzIHRvIHRoZSB3cmFwcGVyXG4gICAgICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICAgICAgbm9kZSA9IG5vZGVzW2luZGV4XTtcbiAgICAgICAgICBub2RlLnNwZWNpZmllZCAmJiB3cmFwcGVyLnNldEF0dHJpYnV0ZShub2RlLm5vZGVOYW1lLCBub2RlLm5vZGVWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY29weSBlbGVtZW50IHN0eWxlcyB0byB0aGUgd3JhcHBlclxuICAgICAgICB3cmFwcGVyLnN0eWxlLmNzc1RleHQgPSBlbGVtZW50LnN0eWxlLmNzc1RleHQ7XG4gICAgICAgIHJldHVybiB3cmFwcGVyO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICAqIFNoaXZzIHRoZSBnaXZlbiBDU1MgdGV4dC5cbiAgICAgICAqIChlZy4gaGVhZGVye30gYmVjb21lcyBodG1sNXNoaXZcXDpoZWFkZXJ7fSlcbiAgICAgICAqIEBwcml2YXRlXG4gICAgICAgKiBAcGFyYW0ge1N0cmluZ30gY3NzVGV4dCBUaGUgQ1NTIHRleHQgdG8gc2hpdi5cbiAgICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzaGl2ZWQgQ1NTIHRleHQuXG4gICAgICAgKi9cbiAgICAgIGZ1bmN0aW9uIHNoaXZDc3NUZXh0KGNzc1RleHQpIHtcbiAgICAgICAgdmFyIHBhaXIsXG4gICAgICAgICAgcGFydHMgPSBjc3NUZXh0LnNwbGl0KCd7JyksXG4gICAgICAgICAgaW5kZXggPSBwYXJ0cy5sZW5ndGgsXG4gICAgICAgICAgcmVFbGVtZW50cyA9IFJlZ0V4cCgnKF58W1xcXFxzLD4rfl0pKCcgKyBnZXRFbGVtZW50cygpLmpvaW4oJ3wnKSArICcpKD89W1tcXFxccyw+K34jLjpdfCQpJywgJ2dpJyksXG4gICAgICAgICAgcmVwbGFjZW1lbnQgPSAnJDEnICsgc2hpdk5hbWVzcGFjZSArICdcXFxcOiQyJztcblxuICAgICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICAgIHBhaXIgPSBwYXJ0c1tpbmRleF0gPSBwYXJ0c1tpbmRleF0uc3BsaXQoJ30nKTtcbiAgICAgICAgICBwYWlyW3BhaXIubGVuZ3RoIC0gMV0gPSBwYWlyW3BhaXIubGVuZ3RoIC0gMV0ucmVwbGFjZShyZUVsZW1lbnRzLCByZXBsYWNlbWVudCk7XG4gICAgICAgICAgcGFydHNbaW5kZXhdID0gcGFpci5qb2luKCd9Jyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcnRzLmpvaW4oJ3snKTtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIHRoZSBnaXZlbiB3cmFwcGVycywgbGVhdmluZyB0aGUgb3JpZ2luYWwgZWxlbWVudHMuXG4gICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICogQHBhcmFtcyB7QXJyYXl9IHdyYXBwZXJzIEFuIGFycmF5IG9mIHByaW50YWJsZSB3cmFwcGVycy5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gcmVtb3ZlV3JhcHBlcnMod3JhcHBlcnMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gd3JhcHBlcnMubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgICAgIHdyYXBwZXJzW2luZGV4XS5yZW1vdmVOb2RlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgICAgIC8qKlxuICAgICAgICogU2hpdnMgdGhlIGdpdmVuIGRvY3VtZW50IGZvciBwcmludC5cbiAgICAgICAqIEBtZW1iZXJPZiBodG1sNVxuICAgICAgICogQHBhcmFtIHtEb2N1bWVudH0gb3duZXJEb2N1bWVudCBUaGUgZG9jdW1lbnQgdG8gc2hpdi5cbiAgICAgICAqIEByZXR1cm5zIHtEb2N1bWVudH0gVGhlIHNoaXZlZCBkb2N1bWVudC5cbiAgICAgICAqL1xuICAgICAgZnVuY3Rpb24gc2hpdlByaW50KG93bmVyRG9jdW1lbnQpIHtcbiAgICAgICAgdmFyIHNoaXZlZFNoZWV0LFxuICAgICAgICAgIHdyYXBwZXJzLFxuICAgICAgICAgIGRhdGEgPSBnZXRFeHBhbmRvRGF0YShvd25lckRvY3VtZW50KSxcbiAgICAgICAgICBuYW1lc3BhY2VzID0gb3duZXJEb2N1bWVudC5uYW1lc3BhY2VzLFxuICAgICAgICAgIG93bmVyV2luZG93ID0gb3duZXJEb2N1bWVudC5wYXJlbnRXaW5kb3c7XG5cbiAgICAgICAgaWYgKCFzdXBwb3J0c1NoaXZhYmxlU2hlZXRzIHx8IG93bmVyRG9jdW1lbnQucHJpbnRTaGl2ZWQpIHtcbiAgICAgICAgICByZXR1cm4gb3duZXJEb2N1bWVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIG5hbWVzcGFjZXNbc2hpdk5hbWVzcGFjZV0gPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBuYW1lc3BhY2VzLmFkZChzaGl2TmFtZXNwYWNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZVNoZWV0KCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dChkYXRhLl9yZW1vdmVTaGVldFRpbWVyKTtcbiAgICAgICAgICBpZiAoc2hpdmVkU2hlZXQpIHtcbiAgICAgICAgICAgIHNoaXZlZFNoZWV0LnJlbW92ZU5vZGUodHJ1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNoaXZlZFNoZWV0PSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgb3duZXJXaW5kb3cuYXR0YWNoRXZlbnQoJ29uYmVmb3JlcHJpbnQnLCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgIHJlbW92ZVNoZWV0KCk7XG5cbiAgICAgICAgICB2YXIgaW1wb3J0cyxcbiAgICAgICAgICAgIGxlbmd0aCxcbiAgICAgICAgICAgIHNoZWV0LFxuICAgICAgICAgICAgY29sbGVjdGlvbiA9IG93bmVyRG9jdW1lbnQuc3R5bGVTaGVldHMsXG4gICAgICAgICAgICBjc3NUZXh0ID0gW10sXG4gICAgICAgICAgICBpbmRleCA9IGNvbGxlY3Rpb24ubGVuZ3RoLFxuICAgICAgICAgICAgc2hlZXRzID0gQXJyYXkoaW5kZXgpO1xuXG4gICAgICAgICAgLy8gY29udmVydCBzdHlsZVNoZWV0cyBjb2xsZWN0aW9uIHRvIGFuIGFycmF5XG4gICAgICAgICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgICAgICAgIHNoZWV0c1tpbmRleF0gPSBjb2xsZWN0aW9uW2luZGV4XTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY29uY2F0IGFsbCBzdHlsZSBzaGVldCBDU1MgdGV4dFxuICAgICAgICAgIHdoaWxlICgoc2hlZXQgPSBzaGVldHMucG9wKCkpKSB7XG4gICAgICAgICAgICAvLyBJRSBkb2VzIG5vdCBlbmZvcmNlIGEgc2FtZSBvcmlnaW4gcG9saWN5IGZvciBleHRlcm5hbCBzdHlsZSBzaGVldHMuLi5cbiAgICAgICAgICAgIC8vIGJ1dCBoYXMgdHJvdWJsZSB3aXRoIHNvbWUgZHluYW1pY2FsbHkgY3JlYXRlZCBzdHlsZXNoZWV0c1xuICAgICAgICAgICAgaWYgKCFzaGVldC5kaXNhYmxlZCAmJiByZU1lZGlhLnRlc3Qoc2hlZXQubWVkaWEpKSB7XG5cbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpbXBvcnRzID0gc2hlZXQuaW1wb3J0cztcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBpbXBvcnRzLmxlbmd0aDtcbiAgICAgICAgICAgICAgfSBjYXRjaChlcil7XG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgIHNoZWV0cy5wdXNoKGltcG9ydHNbaW5kZXhdKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY3NzVGV4dC5wdXNoKHNoZWV0LmNzc1RleHQpO1xuICAgICAgICAgICAgICB9IGNhdGNoKGVyKXt9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gd3JhcCBhbGwgSFRNTDUgZWxlbWVudHMgd2l0aCBwcmludGFibGUgZWxlbWVudHMgYW5kIGFkZCB0aGUgc2hpdmVkIHN0eWxlIHNoZWV0XG4gICAgICAgICAgY3NzVGV4dCA9IHNoaXZDc3NUZXh0KGNzc1RleHQucmV2ZXJzZSgpLmpvaW4oJycpKTtcbiAgICAgICAgICB3cmFwcGVycyA9IGFkZFdyYXBwZXJzKG93bmVyRG9jdW1lbnQpO1xuICAgICAgICAgIHNoaXZlZFNoZWV0ID0gYWRkU3R5bGVTaGVldChvd25lckRvY3VtZW50LCBjc3NUZXh0KTtcblxuICAgICAgICB9KTtcblxuICAgICAgICBvd25lcldpbmRvdy5hdHRhY2hFdmVudCgnb25hZnRlcnByaW50JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIHdyYXBwZXJzLCBsZWF2aW5nIHRoZSBvcmlnaW5hbCBlbGVtZW50cywgYW5kIHJlbW92ZSB0aGUgc2hpdmVkIHN0eWxlIHNoZWV0XG4gICAgICAgICAgcmVtb3ZlV3JhcHBlcnMod3JhcHBlcnMpO1xuICAgICAgICAgIGNsZWFyVGltZW91dChkYXRhLl9yZW1vdmVTaGVldFRpbWVyKTtcbiAgICAgICAgICBkYXRhLl9yZW1vdmVTaGVldFRpbWVyID0gc2V0VGltZW91dChyZW1vdmVTaGVldCwgNTAwKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb3duZXJEb2N1bWVudC5wcmludFNoaXZlZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBvd25lckRvY3VtZW50O1xuICAgICAgfVxuXG4gICAgICAvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuICAgICAgLy8gZXhwb3NlIEFQSVxuICAgICAgaHRtbDUudHlwZSArPSAnIHByaW50JztcbiAgICAgIGh0bWw1LnNoaXZQcmludCA9IHNoaXZQcmludDtcblxuICAgICAgLy8gc2hpdiBmb3IgcHJpbnRcbiAgICAgIHNoaXZQcmludChkb2N1bWVudCk7XG5cbiAgICAgIGlmKHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpe1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGh0bWw1O1xuICAgICAgfVxuXG4gICAgfSh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGRvY3VtZW50KSk7XG4gIH1cblxuICA7XG5cblxuICAvKipcbiAgICogY29udGFpbnMgY2hlY2tzIHRvIHNlZSBpZiBhIHN0cmluZyBjb250YWlucyBhbm90aGVyIHN0cmluZ1xuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIGNvbnRhaW5zXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdHIgLSBUaGUgc3RyaW5nIHdlIHdhbnQgdG8gY2hlY2sgZm9yIHN1YnN0cmluZ3NcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN1YnN0ciAtIFRoZSBzdWJzdHJpbmcgd2Ugd2FudCB0byBzZWFyY2ggdGhlIGZpcnN0IHN0cmluZyBmb3JcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNvbnRhaW5zKHN0ciwgc3Vic3RyKSB7XG4gICAgcmV0dXJuICEhfignJyArIHN0cikuaW5kZXhPZihzdWJzdHIpO1xuICB9XG5cbiAgO1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgb3VyIFwibW9kZXJuaXpyXCIgZWxlbWVudCB0aGF0IHdlIGRvIG1vc3QgZmVhdHVyZSB0ZXN0cyBvbi5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqL1xuXG4gIHZhciBtb2RFbGVtID0ge1xuICAgIGVsZW06IGNyZWF0ZUVsZW1lbnQoJ21vZGVybml6cicpXG4gIH07XG5cbiAgLy8gQ2xlYW4gdXAgdGhpcyBlbGVtZW50XG4gIE1vZGVybml6ci5fcS5wdXNoKGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSBtb2RFbGVtLmVsZW07XG4gIH0pO1xuXG4gIFxuXG4gIHZhciBtU3R5bGUgPSB7XG4gICAgc3R5bGU6IG1vZEVsZW0uZWxlbS5zdHlsZVxuICB9O1xuXG4gIC8vIGtpbGwgcmVmIGZvciBnYywgbXVzdCBoYXBwZW4gYmVmb3JlIG1vZC5lbGVtIGlzIHJlbW92ZWQsIHNvIHdlIHVuc2hpZnQgb24gdG9cbiAgLy8gdGhlIGZyb250IG9mIHRoZSBxdWV1ZS5cbiAgTW9kZXJuaXpyLl9xLnVuc2hpZnQoZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIG1TdHlsZS5zdHlsZTtcbiAgfSk7XG5cbiAgXG5cbiAgLyoqXG4gICAqIGRvbVRvQ1NTIHRha2VzIGEgY2FtZWxDYXNlIHN0cmluZyBhbmQgY29udmVydHMgaXQgdG8ga2ViYWItY2FzZVxuICAgKiBlLmcuIGJveFNpemluZyAtPiBib3gtc2l6aW5nXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb24gZG9tVG9DU1NcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgLSBTdHJpbmcgbmFtZSBvZiBjYW1lbENhc2UgcHJvcCB3ZSB3YW50IHRvIGNvbnZlcnRcbiAgICogQHJldHVybnMge3N0cmluZ30gVGhlIGtlYmFiLWNhc2UgdmVyc2lvbiBvZiB0aGUgc3VwcGxpZWQgbmFtZVxuICAgKi9cblxuICBmdW5jdGlvbiBkb21Ub0NTUyhuYW1lKSB7XG4gICAgcmV0dXJuIG5hbWUucmVwbGFjZSgvKFtBLVpdKS9nLCBmdW5jdGlvbihzdHIsIG0xKSB7XG4gICAgICByZXR1cm4gJy0nICsgbTEudG9Mb3dlckNhc2UoKTtcbiAgICB9KS5yZXBsYWNlKC9ebXMtLywgJy1tcy0nKTtcbiAgfVxuICA7XG5cblxuICAvKipcbiAgICogd3JhcHBlciBhcm91bmQgZ2V0Q29tcHV0ZWRTdHlsZSwgdG8gZml4IGlzc3VlcyB3aXRoIEZpcmVmb3ggcmV0dXJuaW5nIG51bGwgd2hlblxuICAgKiBjYWxsZWQgaW5zaWRlIG9mIGEgaGlkZGVuIGlmcmFtZVxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIGNvbXB1dGVkU3R5bGVcbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudHxTVkdFbGVtZW50fSAtIFRoZSBlbGVtZW50IHdlIHdhbnQgdG8gZmluZCB0aGUgY29tcHV0ZWQgc3R5bGVzIG9mXG4gICAqIEBwYXJhbSB7c3RyaW5nfG51bGx9IFtwc2V1ZG9TZWxlY3Rvcl0tIEFuIG9wdGlvbmFsIHBzZXVkbyBlbGVtZW50IHNlbGVjdG9yIChlLmcuIDpiZWZvcmUpLCBvZiBudWxsIGlmIG5vbmVcbiAgICogQHJldHVybnMge0NTU1N0eWxlRGVjbGFyYXRpb259XG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNvbXB1dGVkU3R5bGUoZWxlbSwgcHNldWRvLCBwcm9wKSB7XG4gICAgdmFyIHJlc3VsdDtcblxuICAgIGlmICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSB7XG4gICAgICByZXN1bHQgPSBnZXRDb21wdXRlZFN0eWxlLmNhbGwod2luZG93LCBlbGVtLCBwc2V1ZG8pO1xuICAgICAgdmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcblxuICAgICAgaWYgKHJlc3VsdCAhPT0gbnVsbCkge1xuICAgICAgICBpZiAocHJvcCkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5nZXRQcm9wZXJ0eVZhbHVlKHByb3ApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoY29uc29sZSkge1xuICAgICAgICAgIHZhciBtZXRob2QgPSBjb25zb2xlLmVycm9yID8gJ2Vycm9yJyA6ICdsb2cnO1xuICAgICAgICAgIGNvbnNvbGVbbWV0aG9kXS5jYWxsKGNvbnNvbGUsICdnZXRDb21wdXRlZFN0eWxlIHJldHVybmluZyBudWxsLCBpdHMgcG9zc2libGUgbW9kZXJuaXpyIHRlc3QgcmVzdWx0cyBhcmUgaW5hY2N1cmF0ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3VsdCA9ICFwc2V1ZG8gJiYgZWxlbS5jdXJyZW50U3R5bGUgJiYgZWxlbS5jdXJyZW50U3R5bGVbcHJvcF07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIDtcblxuICAvKipcbiAgICogbmF0aXZlVGVzdFByb3BzIGFsbG93cyBmb3IgdXMgdG8gdXNlIG5hdGl2ZSBmZWF0dXJlIGRldGVjdGlvbiBmdW5jdGlvbmFsaXR5IGlmIGF2YWlsYWJsZS5cbiAgICogc29tZSBwcmVmaXhlZCBmb3JtLCBvciBmYWxzZSwgaW4gdGhlIGNhc2Ugb2YgYW4gdW5zdXBwb3J0ZWQgcnVsZVxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIG5hdGl2ZVRlc3RQcm9wc1xuICAgKiBAcGFyYW0ge2FycmF5fSBwcm9wcyAtIEFuIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAtIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgd2Ugd2FudCB0byBjaGVjayB2aWEgQHN1cHBvcnRzXG4gICAqIEByZXR1cm5zIHtib29sZWFufHVuZGVmaW5lZH0gQSBib29sZWFuIHdoZW4gQHN1cHBvcnRzIGV4aXN0cywgdW5kZWZpbmVkIG90aGVyd2lzZVxuICAgKi9cblxuICAvLyBBY2NlcHRzIGEgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgYSBzaW5nbGUgdmFsdWVcbiAgLy8gUmV0dXJucyBgdW5kZWZpbmVkYCBpZiBuYXRpdmUgZGV0ZWN0aW9uIG5vdCBhdmFpbGFibGVcbiAgZnVuY3Rpb24gbmF0aXZlVGVzdFByb3BzKHByb3BzLCB2YWx1ZSkge1xuICAgIHZhciBpID0gcHJvcHMubGVuZ3RoO1xuICAgIC8vIFN0YXJ0IHdpdGggdGhlIEpTIEFQSTogaHR0cDovL3d3dy53My5vcmcvVFIvY3NzMy1jb25kaXRpb25hbC8jdGhlLWNzcy1pbnRlcmZhY2VcbiAgICBpZiAoJ0NTUycgaW4gd2luZG93ICYmICdzdXBwb3J0cycgaW4gd2luZG93LkNTUykge1xuICAgICAgLy8gVHJ5IGV2ZXJ5IHByZWZpeGVkIHZhcmlhbnQgb2YgdGhlIHByb3BlcnR5XG4gICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGlmICh3aW5kb3cuQ1NTLnN1cHBvcnRzKGRvbVRvQ1NTKHByb3BzW2ldKSwgdmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gT3RoZXJ3aXNlIGZhbGwgYmFjayB0byBhdC1ydWxlIChmb3IgT3BlcmEgMTIueClcbiAgICBlbHNlIGlmICgnQ1NTU3VwcG9ydHNSdWxlJyBpbiB3aW5kb3cpIHtcbiAgICAgIC8vIEJ1aWxkIGEgY29uZGl0aW9uIHN0cmluZyBmb3IgZXZlcnkgcHJlZml4ZWQgdmFyaWFudFxuICAgICAgdmFyIGNvbmRpdGlvblRleHQgPSBbXTtcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgY29uZGl0aW9uVGV4dC5wdXNoKCcoJyArIGRvbVRvQ1NTKHByb3BzW2ldKSArICc6JyArIHZhbHVlICsgJyknKTtcbiAgICAgIH1cbiAgICAgIGNvbmRpdGlvblRleHQgPSBjb25kaXRpb25UZXh0LmpvaW4oJyBvciAnKTtcbiAgICAgIHJldHVybiBpbmplY3RFbGVtZW50V2l0aFN0eWxlcygnQHN1cHBvcnRzICgnICsgY29uZGl0aW9uVGV4dCArICcpIHsgI21vZGVybml6ciB7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgfSB9JywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICByZXR1cm4gY29tcHV0ZWRTdHlsZShub2RlLCBudWxsLCAncG9zaXRpb24nKSA9PSAnYWJzb2x1dGUnO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbiAgO1xuXG4gIC8qKlxuICAgKiBjc3NUb0RPTSB0YWtlcyBhIGtlYmFiLWNhc2Ugc3RyaW5nIGFuZCBjb252ZXJ0cyBpdCB0byBjYW1lbENhc2VcbiAgICogZS5nLiBib3gtc2l6aW5nIC0+IGJveFNpemluZ1xuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIGNzc1RvRE9NXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIC0gU3RyaW5nIG5hbWUgb2Yga2ViYWItY2FzZSBwcm9wIHdlIHdhbnQgdG8gY29udmVydFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY2FtZWxDYXNlIHZlcnNpb24gb2YgdGhlIHN1cHBsaWVkIG5hbWVcbiAgICovXG5cbiAgZnVuY3Rpb24gY3NzVG9ET00obmFtZSkge1xuICAgIHJldHVybiBuYW1lLnJlcGxhY2UoLyhbYS16XSktKFthLXpdKS9nLCBmdW5jdGlvbihzdHIsIG0xLCBtMikge1xuICAgICAgcmV0dXJuIG0xICsgbTIudG9VcHBlckNhc2UoKTtcbiAgICB9KS5yZXBsYWNlKC9eLS8sICcnKTtcbiAgfVxuICA7XG5cbiAgLy8gdGVzdFByb3BzIGlzIGEgZ2VuZXJpYyBDU1MgLyBET00gcHJvcGVydHkgdGVzdC5cblxuICAvLyBJbiB0ZXN0aW5nIHN1cHBvcnQgZm9yIGEgZ2l2ZW4gQ1NTIHByb3BlcnR5LCBpdCdzIGxlZ2l0IHRvIHRlc3Q6XG4gIC8vICAgIGBlbGVtLnN0eWxlW3N0eWxlTmFtZV0gIT09IHVuZGVmaW5lZGBcbiAgLy8gSWYgdGhlIHByb3BlcnR5IGlzIHN1cHBvcnRlZCBpdCB3aWxsIHJldHVybiBhbiBlbXB0eSBzdHJpbmcsXG4gIC8vIGlmIHVuc3VwcG9ydGVkIGl0IHdpbGwgcmV0dXJuIHVuZGVmaW5lZC5cblxuICAvLyBXZSdsbCB0YWtlIGFkdmFudGFnZSBvZiB0aGlzIHF1aWNrIHRlc3QgYW5kIHNraXAgc2V0dGluZyBhIHN0eWxlXG4gIC8vIG9uIG91ciBtb2Rlcm5penIgZWxlbWVudCwgYnV0IGluc3RlYWQganVzdCB0ZXN0aW5nIHVuZGVmaW5lZCB2c1xuICAvLyBlbXB0eSBzdHJpbmcuXG5cbiAgLy8gUHJvcGVydHkgbmFtZXMgY2FuIGJlIHByb3ZpZGVkIGluIGVpdGhlciBjYW1lbENhc2Ugb3Iga2ViYWItY2FzZS5cblxuICBmdW5jdGlvbiB0ZXN0UHJvcHMocHJvcHMsIHByZWZpeGVkLCB2YWx1ZSwgc2tpcFZhbHVlVGVzdCkge1xuICAgIHNraXBWYWx1ZVRlc3QgPSBpcyhza2lwVmFsdWVUZXN0LCAndW5kZWZpbmVkJykgPyBmYWxzZSA6IHNraXBWYWx1ZVRlc3Q7XG5cbiAgICAvLyBUcnkgbmF0aXZlIGRldGVjdCBmaXJzdFxuICAgIGlmICghaXModmFsdWUsICd1bmRlZmluZWQnKSkge1xuICAgICAgdmFyIHJlc3VsdCA9IG5hdGl2ZVRlc3RQcm9wcyhwcm9wcywgdmFsdWUpO1xuICAgICAgaWYgKCFpcyhyZXN1bHQsICd1bmRlZmluZWQnKSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSBkbyBpdCBwcm9wZXJseVxuICAgIHZhciBhZnRlckluaXQsIGksIHByb3BzTGVuZ3RoLCBwcm9wLCBiZWZvcmU7XG5cbiAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGEgc3R5bGUgZWxlbWVudCwgdGhhdCBtZWFucyB3ZSdyZSBydW5uaW5nIGFzeW5jIG9yIGFmdGVyXG4gICAgLy8gdGhlIGNvcmUgdGVzdHMsIHNvIHdlJ2xsIG5lZWQgdG8gY3JlYXRlIG91ciBvd24gZWxlbWVudHMgdG8gdXNlXG5cbiAgICAvLyBpbnNpZGUgb2YgYW4gU1ZHIGVsZW1lbnQsIGluIGNlcnRhaW4gYnJvd3NlcnMsIHRoZSBgc3R5bGVgIGVsZW1lbnQgaXMgb25seVxuICAgIC8vIGRlZmluZWQgZm9yIHZhbGlkIHRhZ3MuIFRoZXJlZm9yZSwgaWYgYG1vZGVybml6cmAgZG9lcyBub3QgaGF2ZSBvbmUsIHdlXG4gICAgLy8gZmFsbCBiYWNrIHRvIGEgbGVzcyB1c2VkIGVsZW1lbnQgYW5kIGhvcGUgZm9yIHRoZSBiZXN0LlxuICAgIC8vIGZvciBzdHJpY3QgWEhUTUwgYnJvd3NlcnMgdGhlIGhhcmRseSB1c2VkIHNhbXAgZWxlbWVudCBpcyB1c2VkXG4gICAgdmFyIGVsZW1zID0gWydtb2Rlcm5penInLCAndHNwYW4nLCAnc2FtcCddO1xuICAgIHdoaWxlICghbVN0eWxlLnN0eWxlICYmIGVsZW1zLmxlbmd0aCkge1xuICAgICAgYWZ0ZXJJbml0ID0gdHJ1ZTtcbiAgICAgIG1TdHlsZS5tb2RFbGVtID0gY3JlYXRlRWxlbWVudChlbGVtcy5zaGlmdCgpKTtcbiAgICAgIG1TdHlsZS5zdHlsZSA9IG1TdHlsZS5tb2RFbGVtLnN0eWxlO1xuICAgIH1cblxuICAgIC8vIERlbGV0ZSB0aGUgb2JqZWN0cyBpZiB3ZSBjcmVhdGVkIHRoZW0uXG4gICAgZnVuY3Rpb24gY2xlYW5FbGVtcygpIHtcbiAgICAgIGlmIChhZnRlckluaXQpIHtcbiAgICAgICAgZGVsZXRlIG1TdHlsZS5zdHlsZTtcbiAgICAgICAgZGVsZXRlIG1TdHlsZS5tb2RFbGVtO1xuICAgICAgfVxuICAgIH1cblxuICAgIHByb3BzTGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBwcm9wc0xlbmd0aDsgaSsrKSB7XG4gICAgICBwcm9wID0gcHJvcHNbaV07XG4gICAgICBiZWZvcmUgPSBtU3R5bGUuc3R5bGVbcHJvcF07XG5cbiAgICAgIGlmIChjb250YWlucyhwcm9wLCAnLScpKSB7XG4gICAgICAgIHByb3AgPSBjc3NUb0RPTShwcm9wKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG1TdHlsZS5zdHlsZVtwcm9wXSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgLy8gSWYgdmFsdWUgdG8gdGVzdCBoYXMgYmVlbiBwYXNzZWQgaW4sIGRvIGEgc2V0LWFuZC1jaGVjayB0ZXN0LlxuICAgICAgICAvLyAwIChpbnRlZ2VyKSBpcyBhIHZhbGlkIHByb3BlcnR5IHZhbHVlLCBzbyBjaGVjayB0aGF0IGB2YWx1ZWAgaXNuJ3RcbiAgICAgICAgLy8gdW5kZWZpbmVkLCByYXRoZXIgdGhhbiBqdXN0IGNoZWNraW5nIGl0J3MgdHJ1dGh5LlxuICAgICAgICBpZiAoIXNraXBWYWx1ZVRlc3QgJiYgIWlzKHZhbHVlLCAndW5kZWZpbmVkJykpIHtcblxuICAgICAgICAgIC8vIE5lZWRzIGEgdHJ5IGNhdGNoIGJsb2NrIGJlY2F1c2Ugb2Ygb2xkIElFLiBUaGlzIGlzIHNsb3csIGJ1dCB3aWxsXG4gICAgICAgICAgLy8gYmUgYXZvaWRlZCBpbiBtb3N0IGNhc2VzIGJlY2F1c2UgYHNraXBWYWx1ZVRlc3RgIHdpbGwgYmUgdXNlZC5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbVN0eWxlLnN0eWxlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgICAgIC8vIElmIHRoZSBwcm9wZXJ0eSB2YWx1ZSBoYXMgY2hhbmdlZCwgd2UgYXNzdW1lIHRoZSB2YWx1ZSB1c2VkIGlzXG4gICAgICAgICAgLy8gc3VwcG9ydGVkLiBJZiBgdmFsdWVgIGlzIGVtcHR5IHN0cmluZywgaXQnbGwgZmFpbCBoZXJlIChiZWNhdXNlXG4gICAgICAgICAgLy8gaXQgaGFzbid0IGNoYW5nZWQpLCB3aGljaCBtYXRjaGVzIGhvdyBicm93c2VycyBoYXZlIGltcGxlbWVudGVkXG4gICAgICAgICAgLy8gQ1NTLnN1cHBvcnRzKClcbiAgICAgICAgICBpZiAobVN0eWxlLnN0eWxlW3Byb3BdICE9IGJlZm9yZSkge1xuICAgICAgICAgICAgY2xlYW5FbGVtcygpO1xuICAgICAgICAgICAgcmV0dXJuIHByZWZpeGVkID09ICdwZngnID8gcHJvcCA6IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSBqdXN0IHJldHVybiB0cnVlLCBvciB0aGUgcHJvcGVydHkgbmFtZSBpZiB0aGlzIGlzIGFcbiAgICAgICAgLy8gYHByZWZpeGVkKClgIGNhbGxcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY2xlYW5FbGVtcygpO1xuICAgICAgICAgIHJldHVybiBwcmVmaXhlZCA9PSAncGZ4JyA/IHByb3AgOiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNsZWFuRWxlbXMoKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICA7XG5cbiAgLyoqXG4gICAqIHRlc3RQcm9wKCkgaW52ZXN0aWdhdGVzIHdoZXRoZXIgYSBnaXZlbiBzdHlsZSBwcm9wZXJ0eSBpcyByZWNvZ25pemVkXG4gICAqIFByb3BlcnR5IG5hbWVzIGNhbiBiZSBwcm92aWRlZCBpbiBlaXRoZXIgY2FtZWxDYXNlIG9yIGtlYmFiLWNhc2UuXG4gICAqXG4gICAqIEBtZW1iZXJvZiBNb2Rlcm5penJcbiAgICogQG5hbWUgTW9kZXJuaXpyLnRlc3RQcm9wXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqIEBvcHRpb25OYW1lIE1vZGVybml6ci50ZXN0UHJvcCgpXG4gICAqIEBvcHRpb25Qcm9wIHRlc3RQcm9wXG4gICAqIEBmdW5jdGlvbiB0ZXN0UHJvcFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIE5hbWUgb2YgdGhlIENTUyBwcm9wZXJ0eSB0byBjaGVja1xuICAgKiBAcGFyYW0ge3N0cmluZ30gW3ZhbHVlXSAtIE5hbWUgb2YgdGhlIENTUyB2YWx1ZSB0byBjaGVja1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFt1c2VWYWx1ZV0gLSBXaGV0aGVyIG9yIG5vdCB0byBjaGVjayB0aGUgdmFsdWUgaWYgQHN1cHBvcnRzIGlzbid0IHN1cHBvcnRlZFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQGV4YW1wbGVcbiAgICpcbiAgICogSnVzdCBsaWtlIFt0ZXN0QWxsUHJvcHNdKCNtb2Rlcm5penItdGVzdGFsbHByb3BzKSwgb25seSBpdCBkb2VzIG5vdCBjaGVjayBhbnkgdmVuZG9yIHByZWZpeGVkXG4gICAqIHZlcnNpb24gb2YgdGhlIHN0cmluZy5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBwcm9wZXJ0eSBuYW1lIG11c3QgYmUgcHJvdmlkZWQgaW4gY2FtZWxDYXNlIChlLmcuIGJveFNpemluZyBub3QgYm94LXNpemluZylcbiAgICpcbiAgICogYGBganNcbiAgICogTW9kZXJuaXpyLnRlc3RQcm9wKCdwb2ludGVyRXZlbnRzJykgIC8vIHRydWVcbiAgICogYGBgXG4gICAqXG4gICAqIFlvdSBjYW4gYWxzbyBwcm92aWRlIGEgdmFsdWUgYXMgYW4gb3B0aW9uYWwgc2Vjb25kIGFyZ3VtZW50IHRvIGNoZWNrIGlmIGFcbiAgICogc3BlY2lmaWMgdmFsdWUgaXMgc3VwcG9ydGVkXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIE1vZGVybml6ci50ZXN0UHJvcCgncG9pbnRlckV2ZW50cycsICdub25lJykgLy8gdHJ1ZVxuICAgKiBNb2Rlcm5penIudGVzdFByb3AoJ3BvaW50ZXJFdmVudHMnLCAncGVuZ3VpbicpIC8vIGZhbHNlXG4gICAqIGBgYFxuICAgKi9cblxuICB2YXIgdGVzdFByb3AgPSBNb2Rlcm5penJQcm90by50ZXN0UHJvcCA9IGZ1bmN0aW9uKHByb3AsIHZhbHVlLCB1c2VWYWx1ZSkge1xuICAgIHJldHVybiB0ZXN0UHJvcHMoW3Byb3BdLCB1bmRlZmluZWQsIHZhbHVlLCB1c2VWYWx1ZSk7XG4gIH07XG4gIFxuXG4gIC8qKlxuICAgKiBmbkJpbmQgaXMgYSBzdXBlciBzbWFsbCBbYmluZF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRnVuY3Rpb24vYmluZCkgcG9seWZpbGwuXG4gICAqXG4gICAqIEBhY2Nlc3MgcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb24gZm5CaW5kXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIC0gYSBmdW5jdGlvbiB5b3Ugd2FudCB0byBjaGFuZ2UgYHRoaXNgIHJlZmVyZW5jZSB0b1xuICAgKiBAcGFyYW0ge29iamVjdH0gdGhhdCAtIHRoZSBgdGhpc2AgeW91IHdhbnQgdG8gY2FsbCB0aGUgZnVuY3Rpb24gd2l0aFxuICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259IFRoZSB3cmFwcGVkIHZlcnNpb24gb2YgdGhlIHN1cHBsaWVkIGZ1bmN0aW9uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGZuQmluZChmbiwgdGhhdCkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICA7XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgcHJvcGVydHkgdmFsdWVzIHRvIHNldCBmb3IgY3NzIHRlc3RzLiBTZWUgdGlja2V0ICMyMVxuICAgKiBodHRwOi8vZ2l0LmlvL3ZVR2w0XG4gICAqXG4gICAqIEBtZW1iZXJvZiBNb2Rlcm5penJcbiAgICogQG5hbWUgTW9kZXJuaXpyLl9wcmVmaXhlc1xuICAgKiBAb3B0aW9uTmFtZSBNb2Rlcm5penIuX3ByZWZpeGVzXG4gICAqIEBvcHRpb25Qcm9wIHByZWZpeGVzXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIE1vZGVybml6ci5fcHJlZml4ZXMgaXMgdGhlIGludGVybmFsIGxpc3Qgb2YgcHJlZml4ZXMgdGhhdCB3ZSB0ZXN0IGFnYWluc3RcbiAgICogaW5zaWRlIG9mIHRoaW5ncyBsaWtlIFtwcmVmaXhlZF0oI21vZGVybml6ci1wcmVmaXhlZCkgYW5kIFtwcmVmaXhlZENTU10oIy1jb2RlLW1vZGVybml6ci1wcmVmaXhlZGNzcykuIEl0IGlzIHNpbXBseVxuICAgKiBhbiBhcnJheSBvZiBrZWJhYi1jYXNlIHZlbmRvciBwcmVmaXhlcyB5b3UgY2FuIHVzZSB3aXRoaW4geW91ciBjb2RlLlxuICAgKlxuICAgKiBTb21lIGNvbW1vbiB1c2UgY2FzZXMgaW5jbHVkZVxuICAgKlxuICAgKiBHZW5lcmF0aW5nIGFsbCBwb3NzaWJsZSBwcmVmaXhlZCB2ZXJzaW9uIG9mIGEgQ1NTIHByb3BlcnR5XG4gICAqIGBgYGpzXG4gICAqIHZhciBydWxlID0gTW9kZXJuaXpyLl9wcmVmaXhlcy5qb2luKCd0cmFuc2Zvcm06IHJvdGF0ZSgyMGRlZyk7ICcpO1xuICAgKlxuICAgKiBydWxlID09PSAndHJhbnNmb3JtOiByb3RhdGUoMjBkZWcpOyB3ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMjBkZWcpOyBtb3otdHJhbnNmb3JtOiByb3RhdGUoMjBkZWcpOyBvLXRyYW5zZm9ybTogcm90YXRlKDIwZGVnKTsgbXMtdHJhbnNmb3JtOiByb3RhdGUoMjBkZWcpOydcbiAgICogYGBgXG4gICAqXG4gICAqIEdlbmVyYXRpbmcgYWxsIHBvc3NpYmxlIHByZWZpeGVkIHZlcnNpb24gb2YgYSBDU1MgdmFsdWVcbiAgICogYGBganNcbiAgICogcnVsZSA9ICdkaXNwbGF5OicgKyAgTW9kZXJuaXpyLl9wcmVmaXhlcy5qb2luKCdmbGV4OyBkaXNwbGF5OicpICsgJ2ZsZXgnO1xuICAgKlxuICAgKiBydWxlID09PSAnZGlzcGxheTpmbGV4OyBkaXNwbGF5Oi13ZWJraXQtZmxleDsgZGlzcGxheTotbW96LWZsZXg7IGRpc3BsYXk6LW8tZmxleDsgZGlzcGxheTotbXMtZmxleDsgZGlzcGxheTpmbGV4J1xuICAgKiBgYGBcbiAgICovXG5cbiAgLy8gd2UgdXNlIFsnJywnJ10gcmF0aGVyIHRoYW4gYW4gZW1wdHkgYXJyYXkgaW4gb3JkZXIgdG8gYWxsb3cgYSBwYXR0ZXJuIG9mIC5gam9pbigpYGluZyBwcmVmaXhlcyB0byB0ZXN0XG4gIC8vIHZhbHVlcyBpbiBmZWF0dXJlIGRldGVjdHMgdG8gY29udGludWUgdG8gd29ya1xuICB2YXIgcHJlZml4ZXMgPSAoTW9kZXJuaXpyUHJvdG8uX2NvbmZpZy51c2VQcmVmaXhlcyA/ICcgLXdlYmtpdC0gLW1vei0gLW8tIC1tcy0gJy5zcGxpdCgnICcpIDogWycnLCcnXSk7XG5cbiAgLy8gZXhwb3NlIHRoZXNlIGZvciB0aGUgcGx1Z2luIEFQSS4gTG9vayBpbiB0aGUgc291cmNlIGZvciBob3cgdG8gam9pbigpIHRoZW0gYWdhaW5zdCB5b3VyIGlucHV0XG4gIE1vZGVybml6clByb3RvLl9wcmVmaXhlcyA9IHByZWZpeGVzO1xuXG4gIFxuXG4gIC8qKlxuICAgKiB0ZXN0U3R5bGVzIGluamVjdHMgYW4gZWxlbWVudCB3aXRoIHN0eWxlIGVsZW1lbnQgYW5kIHNvbWUgQ1NTIHJ1bGVzXG4gICAqXG4gICAqIEBtZW1iZXJvZiBNb2Rlcm5penJcbiAgICogQG5hbWUgTW9kZXJuaXpyLnRlc3RTdHlsZXNcbiAgICogQG9wdGlvbk5hbWUgTW9kZXJuaXpyLnRlc3RTdHlsZXMoKVxuICAgKiBAb3B0aW9uUHJvcCB0ZXN0U3R5bGVzXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqIEBmdW5jdGlvbiB0ZXN0U3R5bGVzXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBydWxlIC0gU3RyaW5nIHJlcHJlc2VudGluZyBhIGNzcyBydWxlXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gQSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gdGVzdCB0aGUgaW5qZWN0ZWQgZWxlbWVudFxuICAgKiBAcGFyYW0ge251bWJlcn0gW25vZGVzXSAtIEFuIGludGVnZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2YgYWRkaXRpb25hbCBub2RlcyB5b3Ugd2FudCBpbmplY3RlZFxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBbdGVzdG5hbWVzXSAtIEFuIGFycmF5IG9mIHN0cmluZ3MgdGhhdCBhcmUgdXNlZCBhcyBpZHMgZm9yIHRoZSBhZGRpdGlvbmFsIG5vZGVzXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBgTW9kZXJuaXpyLnRlc3RTdHlsZXNgIHRha2VzIGEgQ1NTIHJ1bGUgYW5kIGluamVjdHMgaXQgb250byB0aGUgY3VycmVudCBwYWdlXG4gICAqIGFsb25nIHdpdGggKHBvc3NpYmx5IG11bHRpcGxlKSBET00gZWxlbWVudHMuIFRoaXMgbGV0cyB5b3UgY2hlY2sgZm9yIGZlYXR1cmVzXG4gICAqIHRoYXQgY2FuIG5vdCBiZSBkZXRlY3RlZCBieSBzaW1wbHkgY2hlY2tpbmcgdGhlIFtJRExdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvTW96aWxsYS9EZXZlbG9wZXJfZ3VpZGUvSW50ZXJmYWNlX2RldmVsb3BtZW50X2d1aWRlL0lETF9pbnRlcmZhY2VfcnVsZXMpLlxuICAgKlxuICAgKiBgYGBqc1xuICAgKiBNb2Rlcm5penIudGVzdFN0eWxlcygnI21vZGVybml6ciB7IHdpZHRoOiA5cHg7IGNvbG9yOiBwYXBheWF3aGlwOyB9JywgZnVuY3Rpb24oZWxlbSwgcnVsZSkge1xuICAgKiAgIC8vIGVsZW0gaXMgdGhlIGZpcnN0IERPTSBub2RlIGluIHRoZSBwYWdlIChieSBkZWZhdWx0ICNtb2Rlcm5penIpXG4gICAqICAgLy8gcnVsZSBpcyB0aGUgZmlyc3QgYXJndW1lbnQgeW91IHN1cHBsaWVkIC0gdGhlIENTUyBydWxlIGluIHN0cmluZyBmb3JtXG4gICAqXG4gICAqICAgYWRkVGVzdCgnd2lkdGh3b3JrcycsIGVsZW0uc3R5bGUud2lkdGggPT09ICc5cHgnKVxuICAgKiB9KTtcbiAgICogYGBgXG4gICAqXG4gICAqIElmIHlvdXIgdGVzdCByZXF1aXJlcyBtdWx0aXBsZSBub2RlcywgeW91IGNhbiBpbmNsdWRlIGEgdGhpcmQgYXJndW1lbnRcbiAgICogaW5kaWNhdGluZyBob3cgbWFueSBhZGRpdGlvbmFsIGRpdiBlbGVtZW50cyB0byBpbmNsdWRlIG9uIHRoZSBwYWdlLiBUaGVcbiAgICogYWRkaXRpb25hbCBub2RlcyBhcmUgaW5qZWN0ZWQgYXMgY2hpbGRyZW4gb2YgdGhlIGBlbGVtYCB0aGF0IGlzIHJldHVybmVkIGFzXG4gICAqIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIE1vZGVybml6ci50ZXN0U3R5bGVzKCcjbW9kZXJuaXpyIHt3aWR0aDogMXB4fTsgI21vZGVybml6cjIge3dpZHRoOiAycHh9JywgZnVuY3Rpb24oZWxlbSkge1xuICAgKiAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2Rlcm5penInKS5zdHlsZS53aWR0aCA9PT0gJzFweCc7IC8vIHRydWVcbiAgICogICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZXJuaXpyMicpLnN0eWxlLndpZHRoID09PSAnMnB4JzsgLy8gdHJ1ZVxuICAgKiAgIGVsZW0uZmlyc3RDaGlsZCA9PT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGVybml6cjInKTsgLy8gdHJ1ZVxuICAgKiB9LCAxKTtcbiAgICogYGBgXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIGFsbCBvZiB0aGUgYWRkaXRpb25hbCBlbGVtZW50cyBoYXZlIGFuIElEIG9mIGBtb2Rlcm5penJbbl1gLCB3aGVyZVxuICAgKiBgbmAgaXMgaXRzIGluZGV4IChlLmcuIHRoZSBmaXJzdCBhZGRpdGlvbmFsLCBzZWNvbmQgb3ZlcmFsbCBpcyBgI21vZGVybml6cjJgLFxuICAgKiB0aGUgc2Vjb25kIGFkZGl0aW9uYWwgaXMgYCNtb2Rlcm5penIzYCwgZXRjLikuXG4gICAqIElmIHlvdSB3YW50IHRvIGhhdmUgbW9yZSBtZWFuaW5nZnVsIElEcyBmb3IgeW91ciBmdW5jdGlvbiwgeW91IGNhbiBwcm92aWRlXG4gICAqIHRoZW0gYXMgdGhlIGZvdXJ0aCBhcmd1bWVudCwgYXMgYW4gYXJyYXkgb2Ygc3RyaW5nc1xuICAgKlxuICAgKiBgYGBqc1xuICAgKiBNb2Rlcm5penIudGVzdFN0eWxlcygnI2ZvbyB7d2lkdGg6IDEwcHh9OyAjYmFyIHtoZWlnaHQ6IDIwcHh9JywgZnVuY3Rpb24oZWxlbSkge1xuICAgKiAgIGVsZW0uZmlyc3RDaGlsZCA9PT0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvbycpOyAvLyB0cnVlXG4gICAqICAgZWxlbS5sYXN0Q2hpbGQgPT09IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdiYXInKTsgLy8gdHJ1ZVxuICAgKiB9LCAyLCBbJ2ZvbycsICdiYXInXSk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cblxuICB2YXIgdGVzdFN0eWxlcyA9IE1vZGVybml6clByb3RvLnRlc3RTdHlsZXMgPSBpbmplY3RFbGVtZW50V2l0aFN0eWxlcztcbiAgXG4vKiFcbntcbiAgXCJuYW1lXCI6IFwiVG91Y2ggRXZlbnRzXCIsXG4gIFwicHJvcGVydHlcIjogXCJ0b3VjaGV2ZW50c1wiLFxuICBcImNhbml1c2VcIiA6IFwidG91Y2hcIixcbiAgXCJ0YWdzXCI6IFtcIm1lZGlhXCIsIFwiYXR0cmlidXRlXCJdLFxuICBcIm5vdGVzXCI6IFt7XG4gICAgXCJuYW1lXCI6IFwiVG91Y2ggRXZlbnRzIHNwZWNcIixcbiAgICBcImhyZWZcIjogXCJodHRwczovL3d3dy53My5vcmcvVFIvMjAxMy9XRC10b3VjaC1ldmVudHMtMjAxMzAxMjQvXCJcbiAgfV0sXG4gIFwid2FybmluZ3NcIjogW1xuICAgIFwiSW5kaWNhdGVzIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIHRoZSBUb3VjaCBFdmVudHMgc3BlYywgYW5kIGRvZXMgbm90IG5lY2Vzc2FyaWx5IHJlZmxlY3QgYSB0b3VjaHNjcmVlbiBkZXZpY2VcIlxuICBdLFxuICBcImtub3duQnVnc1wiOiBbXG4gICAgXCJGYWxzZS1wb3NpdGl2ZSBvbiBzb21lIGNvbmZpZ3VyYXRpb25zIG9mIE5va2lhIE45MDBcIixcbiAgICBcIkZhbHNlLXBvc2l0aXZlIG9uIHNvbWUgQmxhY2tCZXJyeSA2LjAgYnVpbGRzIOKAkyBodHRwczovL2dpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvMzcyI2lzc3VlY29tbWVudC0zMTEyNjk1XCJcbiAgXVxufVxuISovXG4vKiBET0NcbkluZGljYXRlcyBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0aGUgVzNDIFRvdWNoIEV2ZW50cyBBUEkuXG5cblRoaXMgKmRvZXMgbm90KiBuZWNlc3NhcmlseSByZWZsZWN0IGEgdG91Y2hzY3JlZW4gZGV2aWNlOlxuXG4qIE9sZGVyIHRvdWNoc2NyZWVuIGRldmljZXMgb25seSBlbXVsYXRlIG1vdXNlIGV2ZW50c1xuKiBNb2Rlcm4gSUUgdG91Y2ggZGV2aWNlcyBpbXBsZW1lbnQgdGhlIFBvaW50ZXIgRXZlbnRzIEFQSSBpbnN0ZWFkOiB1c2UgYE1vZGVybml6ci5wb2ludGVyZXZlbnRzYCB0byBkZXRlY3Qgc3VwcG9ydCBmb3IgdGhhdFxuKiBTb21lIGJyb3dzZXJzICYgT1Mgc2V0dXBzIG1heSBlbmFibGUgdG91Y2ggQVBJcyB3aGVuIG5vIHRvdWNoc2NyZWVuIGlzIGNvbm5lY3RlZFxuKiBGdXR1cmUgYnJvd3NlcnMgbWF5IGltcGxlbWVudCBvdGhlciBldmVudCBtb2RlbHMgZm9yIHRvdWNoIGludGVyYWN0aW9uc1xuXG5TZWUgdGhpcyBhcnRpY2xlOiBbWW91IENhbid0IERldGVjdCBBIFRvdWNoc2NyZWVuXShodHRwOi8vd3d3LnN0dWNveC5jb20vYmxvZy95b3UtY2FudC1kZXRlY3QtYS10b3VjaHNjcmVlbi8pLlxuXG5JdCdzIHJlY29tbWVuZGVkIHRvIGJpbmQgYm90aCBtb3VzZSBhbmQgdG91Y2gvcG9pbnRlciBldmVudHMgc2ltdWx0YW5lb3VzbHkg4oCTIHNlZSBbdGhpcyBIVE1MNSBSb2NrcyB0dXRvcmlhbF0oaHR0cDovL3d3dy5odG1sNXJvY2tzLmNvbS9lbi9tb2JpbGUvdG91Y2hhbmRtb3VzZS8pLlxuXG5UaGlzIHRlc3Qgd2lsbCBhbHNvIHJldHVybiBgdHJ1ZWAgZm9yIEZpcmVmb3ggNCBNdWx0aXRvdWNoIHN1cHBvcnQuXG4qL1xuXG4gIC8vIENocm9tZSAoZGVza3RvcCkgdXNlZCB0byBsaWUgYWJvdXQgaXRzIHN1cHBvcnQgb24gdGhpcywgYnV0IHRoYXQgaGFzIHNpbmNlIGJlZW4gcmVjdGlmaWVkOiBodHRwOi8vY3JidWcuY29tLzM2NDE1XG4gIE1vZGVybml6ci5hZGRUZXN0KCd0b3VjaGV2ZW50cycsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBib29sO1xuICAgIGlmICgoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KSB8fCB3aW5kb3cuRG9jdW1lbnRUb3VjaCAmJiBkb2N1bWVudCBpbnN0YW5jZW9mIERvY3VtZW50VG91Y2gpIHtcbiAgICAgIGJvb2wgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpbmNsdWRlIHRoZSAnaGVhcnR6JyBhcyBhIHdheSB0byBoYXZlIGEgbm9uIG1hdGNoaW5nIE1RIHRvIGhlbHAgdGVybWluYXRlIHRoZSBqb2luXG4gICAgICAvLyBodHRwczovL2dpdC5pby92em5GSFxuICAgICAgdmFyIHF1ZXJ5ID0gWydAbWVkaWEgKCcsIHByZWZpeGVzLmpvaW4oJ3RvdWNoLWVuYWJsZWQpLCgnKSwgJ2hlYXJ0eicsICcpJywgJ3sjbW9kZXJuaXpye3RvcDo5cHg7cG9zaXRpb246YWJzb2x1dGV9fSddLmpvaW4oJycpO1xuICAgICAgdGVzdFN0eWxlcyhxdWVyeSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBib29sID0gbm9kZS5vZmZzZXRUb3AgPT09IDk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGJvb2w7XG4gIH0pO1xuXG4vKiFcbntcbiAgXCJuYW1lXCI6IFwiU1ZHIGFzIGFuIDxpbWc+IHRhZyBzb3VyY2VcIixcbiAgXCJwcm9wZXJ0eVwiOiBcInN2Z2FzaW1nXCIsXG4gIFwiY2FuaXVzZVwiIDogXCJzdmctaW1nXCIsXG4gIFwidGFnc1wiOiBbXCJzdmdcIl0sXG4gIFwiYWxpYXNlc1wiOiBbXCJzdmdpbmNzc1wiXSxcbiAgXCJhdXRob3JzXCI6IFtcIkNocmlzIENveWllclwiXSxcbiAgXCJub3Rlc1wiOiBbe1xuICAgIFwibmFtZVwiOiBcIkhUTUw1IFNwZWNcIixcbiAgICBcImhyZWZcIjogXCJodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9lbWJlZGRlZC1jb250ZW50LTAuaHRtbCN0aGUtaW1nLWVsZW1lbnRcIlxuICB9XVxufVxuISovXG5cblxuICAvLyBPcmlnaW5hbCBBc3luYyB0ZXN0IGJ5IFN0dSBDb3hcbiAgLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vY2hyaXNjb3lpZXIvODc3NDUwMVxuXG4gIC8vIE5vdyBhIFN5bmMgdGVzdCBiYXNlZCBvbiBnb29kIHJlc3VsdHMgaGVyZVxuICAvLyBodHRwOi8vY29kZXBlbi5pby9jaHJpc2NveWllci9wZW4vYkFERnhcblxuICAvLyBOb3RlIGh0dHA6Ly93d3cudzMub3JnL1RSL1NWRzExL2ZlYXR1cmUjSW1hZ2UgaXMgKnN1cHBvc2VkKiB0byByZXByZXNlbnRcbiAgLy8gc3VwcG9ydCBmb3IgdGhlIGA8aW1hZ2U+YCB0YWcgaW4gU1ZHLCBub3QgYW4gU1ZHIGZpbGUgbGlua2VkIGZyb20gYW4gYDxpbWc+YFxuICAvLyB0YWcgaW4gSFRNTCDigJMgYnV0IGl04oCZcyBhIGhldXJpc3RpYyB3aGljaCB3b3Jrc1xuICBNb2Rlcm5penIuYWRkVGVzdCgnc3ZnYXNpbWcnLCBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5oYXNGZWF0dXJlKCdodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcxMS9mZWF0dXJlI0ltYWdlJywgJzEuMScpKTtcblxuLyohXG57XG4gIFwibmFtZVwiOiBcInBsYWNlaG9sZGVyIGF0dHJpYnV0ZVwiLFxuICBcInByb3BlcnR5XCI6IFwicGxhY2Vob2xkZXJcIixcbiAgXCJ0YWdzXCI6IFtcImZvcm1zXCIsIFwiYXR0cmlidXRlXCJdLFxuICBcImJ1aWxkZXJBbGlhc2VzXCI6IFtcImZvcm1zX3BsYWNlaG9sZGVyXCJdXG59XG4hKi9cbi8qIERPQ1xuVGVzdHMgZm9yIHBsYWNlaG9sZGVyIGF0dHJpYnV0ZSBpbiBpbnB1dHMgYW5kIHRleHRhcmVhc1xuKi9cblxuICBNb2Rlcm5penIuYWRkVGVzdCgncGxhY2Vob2xkZXInLCAoJ3BsYWNlaG9sZGVyJyBpbiBjcmVhdGVFbGVtZW50KCdpbnB1dCcpICYmICdwbGFjZWhvbGRlcicgaW4gY3JlYXRlRWxlbWVudCgndGV4dGFyZWEnKSkpO1xuXG5cbiAgLyoqXG4gICAqIElmIHRoZSBicm93c2VycyBmb2xsb3cgdGhlIHNwZWMsIHRoZW4gdGhleSB3b3VsZCBleHBvc2UgdmVuZG9yLXNwZWNpZmljIHN0eWxlcyBhczpcbiAgICogICBlbGVtLnN0eWxlLldlYmtpdEJvcmRlclJhZGl1c1xuICAgKiBpbnN0ZWFkIG9mIHNvbWV0aGluZyBsaWtlIHRoZSBmb2xsb3dpbmcgKHdoaWNoIGlzIHRlY2huaWNhbGx5IGluY29ycmVjdCk6XG4gICAqICAgZWxlbS5zdHlsZS53ZWJraXRCb3JkZXJSYWRpdXNcblxuICAgKiBXZWJLaXQgZ2hvc3RzIHRoZWlyIHByb3BlcnRpZXMgaW4gbG93ZXJjYXNlIGJ1dCBPcGVyYSAmIE1veiBkbyBub3QuXG4gICAqIE1pY3Jvc29mdCB1c2VzIGEgbG93ZXJjYXNlIGBtc2AgaW5zdGVhZCBvZiB0aGUgY29ycmVjdCBgTXNgIGluIElFOCtcbiAgICogICBlcmlrLmVhZS5uZXQvYXJjaGl2ZXMvMjAwOC8wMy8xMC8yMS40OC4xMC9cblxuICAgKiBNb3JlIGhlcmU6IGdpdGh1Yi5jb20vTW9kZXJuaXpyL01vZGVybml6ci9pc3N1ZXMvaXNzdWUvMjFcbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2ZW5kb3Itc3BlY2lmaWMgc3R5bGUgcHJvcGVydGllc1xuICAgKi9cblxuICB2YXIgb21QcmVmaXhlcyA9ICdNb3ogTyBtcyBXZWJraXQnO1xuICBcblxuICB2YXIgY3Nzb21QcmVmaXhlcyA9IChNb2Rlcm5penJQcm90by5fY29uZmlnLnVzZVByZWZpeGVzID8gb21QcmVmaXhlcy5zcGxpdCgnICcpIDogW10pO1xuICBNb2Rlcm5penJQcm90by5fY3Nzb21QcmVmaXhlcyA9IGNzc29tUHJlZml4ZXM7XG4gIFxuXG4gIC8qKlxuICAgKiBMaXN0IG9mIEphdmFTY3JpcHQgRE9NIHZhbHVlcyB1c2VkIGZvciB0ZXN0c1xuICAgKlxuICAgKiBAbWVtYmVyb2YgTW9kZXJuaXpyXG4gICAqIEBuYW1lIE1vZGVybml6ci5fZG9tUHJlZml4ZXNcbiAgICogQG9wdGlvbk5hbWUgTW9kZXJuaXpyLl9kb21QcmVmaXhlc1xuICAgKiBAb3B0aW9uUHJvcCBkb21QcmVmaXhlc1xuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiBNb2Rlcm5penIuX2RvbVByZWZpeGVzIGlzIGV4YWN0bHkgdGhlIHNhbWUgYXMgW19wcmVmaXhlc10oI21vZGVybml6ci1fcHJlZml4ZXMpLCBidXQgcmF0aGVyXG4gICAqIHRoYW4ga2ViYWItY2FzZSBwcm9wZXJ0aWVzLCBhbGwgcHJvcGVydGllcyBhcmUgdGhlaXIgQ2FwaXRhbGl6ZWQgdmFyaWFudFxuICAgKlxuICAgKiBgYGBqc1xuICAgKiBNb2Rlcm5penIuX2RvbVByZWZpeGVzID09PSBbIFwiTW96XCIsIFwiT1wiLCBcIm1zXCIsIFwiV2Via2l0XCIgXTtcbiAgICogYGBgXG4gICAqL1xuXG4gIHZhciBkb21QcmVmaXhlcyA9IChNb2Rlcm5penJQcm90by5fY29uZmlnLnVzZVByZWZpeGVzID8gb21QcmVmaXhlcy50b0xvd2VyQ2FzZSgpLnNwbGl0KCcgJykgOiBbXSk7XG4gIE1vZGVybml6clByb3RvLl9kb21QcmVmaXhlcyA9IGRvbVByZWZpeGVzO1xuICBcblxuICAvKipcbiAgICogdGVzdERPTVByb3BzIGlzIGEgZ2VuZXJpYyBET00gcHJvcGVydHkgdGVzdDsgaWYgYSBicm93c2VyIHN1cHBvcnRzXG4gICAqICAgYSBjZXJ0YWluIHByb3BlcnR5LCBpdCB3b24ndCByZXR1cm4gdW5kZWZpbmVkIGZvciBpdC5cbiAgICpcbiAgICogQGFjY2VzcyBwcml2YXRlXG4gICAqIEBmdW5jdGlvbiB0ZXN0RE9NUHJvcHNcbiAgICogQHBhcmFtIHthcnJheS48c3RyaW5nPn0gcHJvcHMgLSBBbiBhcnJheSBvZiBwcm9wZXJ0aWVzIHRvIHRlc3QgZm9yXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvYmogLSBBbiBvYmplY3Qgb3IgRWxlbWVudCB5b3Ugd2FudCB0byB1c2UgdG8gdGVzdCB0aGUgcGFyYW1ldGVycyBhZ2FpblxuICAgKiBAcGFyYW0ge2Jvb2xlYW58b2JqZWN0fSBlbGVtIC0gQW4gRWxlbWVudCB0byBiaW5kIHRoZSBwcm9wZXJ0eSBsb29rdXAgYWdhaW4uIFVzZSBgZmFsc2VgIHRvIHByZXZlbnQgdGhlIGNoZWNrXG4gICAqIEByZXR1cm5zIHtmYWxzZXwqfSByZXR1cm5zIGZhbHNlIGlmIHRoZSBwcm9wIGlzIHVuc3VwcG9ydGVkLCBvdGhlcndpc2UgdGhlIHZhbHVlIHRoYXQgaXMgc3VwcG9ydGVkXG4gICAqL1xuICBmdW5jdGlvbiB0ZXN0RE9NUHJvcHMocHJvcHMsIG9iaiwgZWxlbSkge1xuICAgIHZhciBpdGVtO1xuXG4gICAgZm9yICh2YXIgaSBpbiBwcm9wcykge1xuICAgICAgaWYgKHByb3BzW2ldIGluIG9iaikge1xuXG4gICAgICAgIC8vIHJldHVybiB0aGUgcHJvcGVydHkgbmFtZSBhcyBhIHN0cmluZ1xuICAgICAgICBpZiAoZWxlbSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICByZXR1cm4gcHJvcHNbaV07XG4gICAgICAgIH1cblxuICAgICAgICBpdGVtID0gb2JqW3Byb3BzW2ldXTtcblxuICAgICAgICAvLyBsZXQncyBiaW5kIGEgZnVuY3Rpb25cbiAgICAgICAgaWYgKGlzKGl0ZW0sICdmdW5jdGlvbicpKSB7XG4gICAgICAgICAgLy8gYmluZCB0byBvYmogdW5sZXNzIG92ZXJyaWRlblxuICAgICAgICAgIHJldHVybiBmbkJpbmQoaXRlbSwgZWxlbSB8fCBvYmopO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmV0dXJuIHRoZSB1bmJvdW5kIGZ1bmN0aW9uIG9yIG9iaiBvciB2YWx1ZVxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgO1xuXG4gIC8qKlxuICAgKiB0ZXN0UHJvcHNBbGwgdGVzdHMgYSBsaXN0IG9mIERPTSBwcm9wZXJ0aWVzIHdlIHdhbnQgdG8gY2hlY2sgYWdhaW5zdC5cbiAgICogV2Ugc3BlY2lmeSBsaXRlcmFsbHkgQUxMIHBvc3NpYmxlIChrbm93biBhbmQvb3IgbGlrZWx5KSBwcm9wZXJ0aWVzIG9uXG4gICAqIHRoZSBlbGVtZW50IGluY2x1ZGluZyB0aGUgbm9uLXZlbmRvciBwcmVmaXhlZCBvbmUsIGZvciBmb3J3YXJkLVxuICAgKiBjb21wYXRpYmlsaXR5LlxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQGZ1bmN0aW9uIHRlc3RQcm9wc0FsbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIEEgc3RyaW5nIG9mIHRoZSBwcm9wZXJ0eSB0byB0ZXN0IGZvclxuICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IFtwcmVmaXhlZF0gLSBBbiBvYmplY3QgdG8gY2hlY2sgdGhlIHByZWZpeGVkIHByb3BlcnRpZXMgb24uIFVzZSBhIHN0cmluZyB0byBza2lwXG4gICAqIEBwYXJhbSB7SFRNTEVsZW1lbnR8U1ZHRWxlbWVudH0gW2VsZW1dIC0gQW4gZWxlbWVudCB1c2VkIHRvIHRlc3QgdGhlIHByb3BlcnR5IGFuZCB2YWx1ZSBhZ2FpbnN0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdmFsdWVdIC0gQSBzdHJpbmcgb2YgYSBjc3MgdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFufSBbc2tpcFZhbHVlVGVzdF0gLSBBbiBib29sZWFuIHJlcHJlc2VudGluZyBpZiB5b3Ugd2FudCB0byB0ZXN0IGlmIHZhbHVlIHN0aWNrcyB3aGVuIHNldFxuICAgKiBAcmV0dXJucyB7ZmFsc2V8c3RyaW5nfSByZXR1cm5zIHRoZSBzdHJpbmcgdmVyc2lvbiBvZiB0aGUgcHJvcGVydHksIG9yIGZhbHNlIGlmIGl0IGlzIHVuc3VwcG9ydGVkXG4gICAqL1xuICBmdW5jdGlvbiB0ZXN0UHJvcHNBbGwocHJvcCwgcHJlZml4ZWQsIGVsZW0sIHZhbHVlLCBza2lwVmFsdWVUZXN0KSB7XG5cbiAgICB2YXIgdWNQcm9wID0gcHJvcC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSksXG4gICAgICBwcm9wcyA9IChwcm9wICsgJyAnICsgY3Nzb21QcmVmaXhlcy5qb2luKHVjUHJvcCArICcgJykgKyB1Y1Byb3ApLnNwbGl0KCcgJyk7XG5cbiAgICAvLyBkaWQgdGhleSBjYWxsIC5wcmVmaXhlZCgnYm94U2l6aW5nJykgb3IgYXJlIHdlIGp1c3QgdGVzdGluZyBhIHByb3A/XG4gICAgaWYgKGlzKHByZWZpeGVkLCAnc3RyaW5nJykgfHwgaXMocHJlZml4ZWQsICd1bmRlZmluZWQnKSkge1xuICAgICAgcmV0dXJuIHRlc3RQcm9wcyhwcm9wcywgcHJlZml4ZWQsIHZhbHVlLCBza2lwVmFsdWVUZXN0KTtcblxuICAgICAgLy8gb3RoZXJ3aXNlLCB0aGV5IGNhbGxlZCAucHJlZml4ZWQoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsIHdpbmRvd1ssIGVsZW1dKVxuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wcyA9IChwcm9wICsgJyAnICsgKGRvbVByZWZpeGVzKS5qb2luKHVjUHJvcCArICcgJykgKyB1Y1Byb3ApLnNwbGl0KCcgJyk7XG4gICAgICByZXR1cm4gdGVzdERPTVByb3BzKHByb3BzLCBwcmVmaXhlZCwgZWxlbSk7XG4gICAgfVxuICB9XG5cbiAgLy8gTW9kZXJuaXpyLnRlc3RBbGxQcm9wcygpIGludmVzdGlnYXRlcyB3aGV0aGVyIGEgZ2l2ZW4gc3R5bGUgcHJvcGVydHksXG4gIC8vIG9yIGFueSBvZiBpdHMgdmVuZG9yLXByZWZpeGVkIHZhcmlhbnRzLCBpcyByZWNvZ25pemVkXG4gIC8vXG4gIC8vIE5vdGUgdGhhdCB0aGUgcHJvcGVydHkgbmFtZXMgbXVzdCBiZSBwcm92aWRlZCBpbiB0aGUgY2FtZWxDYXNlIHZhcmlhbnQuXG4gIC8vIE1vZGVybml6ci50ZXN0QWxsUHJvcHMoJ2JveFNpemluZycpXG4gIE1vZGVybml6clByb3RvLnRlc3RBbGxQcm9wcyA9IHRlc3RQcm9wc0FsbDtcblxuICBcblxuICAvKipcbiAgICogdGVzdEFsbFByb3BzIGRldGVybWluZXMgd2hldGhlciBhIGdpdmVuIENTUyBwcm9wZXJ0eSBpcyBzdXBwb3J0ZWQgaW4gdGhlIGJyb3dzZXJcbiAgICpcbiAgICogQG1lbWJlcm9mIE1vZGVybml6clxuICAgKiBAbmFtZSBNb2Rlcm5penIudGVzdEFsbFByb3BzXG4gICAqIEBvcHRpb25OYW1lIE1vZGVybml6ci50ZXN0QWxsUHJvcHMoKVxuICAgKiBAb3B0aW9uUHJvcCB0ZXN0QWxsUHJvcHNcbiAgICogQGFjY2VzcyBwdWJsaWNcbiAgICogQGZ1bmN0aW9uIHRlc3RBbGxQcm9wc1xuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIFN0cmluZyBuYW1pbmcgdGhlIHByb3BlcnR5IHRvIHRlc3QgKGVpdGhlciBjYW1lbENhc2Ugb3Iga2ViYWItY2FzZSlcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt2YWx1ZV0gLSBTdHJpbmcgb2YgdGhlIHZhbHVlIHRvIHRlc3RcbiAgICogQHBhcmFtIHtib29sZWFufSBbc2tpcFZhbHVlVGVzdD1mYWxzZV0gLSBXaGV0aGVyIHRvIHNraXAgdGVzdGluZyB0aGF0IHRoZSB2YWx1ZSBpcyBzdXBwb3J0ZWQgd2hlbiB1c2luZyBub24tbmF0aXZlIGRldGVjdGlvblxuICAgKiBAZXhhbXBsZVxuICAgKlxuICAgKiB0ZXN0QWxsUHJvcHMgZGV0ZXJtaW5lcyB3aGV0aGVyIGEgZ2l2ZW4gQ1NTIHByb3BlcnR5LCBpbiBzb21lIHByZWZpeGVkIGZvcm0sXG4gICAqIGlzIHN1cHBvcnRlZCBieSB0aGUgYnJvd3Nlci5cbiAgICpcbiAgICogYGBganNcbiAgICogdGVzdEFsbFByb3BzKCdib3hTaXppbmcnKSAgLy8gdHJ1ZVxuICAgKiBgYGBcbiAgICpcbiAgICogSXQgY2FuIG9wdGlvbmFsbHkgYmUgZ2l2ZW4gYSBDU1MgdmFsdWUgaW4gc3RyaW5nIGZvcm0gdG8gdGVzdCBpZiBhIHByb3BlcnR5XG4gICAqIHZhbHVlIGlzIHZhbGlkXG4gICAqXG4gICAqIGBgYGpzXG4gICAqIHRlc3RBbGxQcm9wcygnZGlzcGxheScsICdibG9jaycpIC8vIHRydWVcbiAgICogdGVzdEFsbFByb3BzKCdkaXNwbGF5JywgJ3Blbmd1aW4nKSAvLyBmYWxzZVxuICAgKiBgYGBcbiAgICpcbiAgICogQSBib29sZWFuIGNhbiBiZSBwYXNzZWQgYXMgYSB0aGlyZCBwYXJhbWV0ZXIgdG8gc2tpcCB0aGUgdmFsdWUgY2hlY2sgd2hlblxuICAgKiBuYXRpdmUgZGV0ZWN0aW9uIChAc3VwcG9ydHMpIGlzbid0IGF2YWlsYWJsZS5cbiAgICpcbiAgICogYGBganNcbiAgICogdGVzdEFsbFByb3BzKCdzaGFwZU91dHNpZGUnLCAnY29udGVudC1ib3gnLCB0cnVlKTtcbiAgICogYGBgXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHRlc3RBbGxQcm9wcyhwcm9wLCB2YWx1ZSwgc2tpcFZhbHVlVGVzdCkge1xuICAgIHJldHVybiB0ZXN0UHJvcHNBbGwocHJvcCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHZhbHVlLCBza2lwVmFsdWVUZXN0KTtcbiAgfVxuICBNb2Rlcm5penJQcm90by50ZXN0QWxsUHJvcHMgPSB0ZXN0QWxsUHJvcHM7XG4gIFxuLyohXG57XG4gIFwibmFtZVwiOiBcIkNTUyBUcmFuc2l0aW9uc1wiLFxuICBcInByb3BlcnR5XCI6IFwiY3NzdHJhbnNpdGlvbnNcIixcbiAgXCJjYW5pdXNlXCI6IFwiY3NzLXRyYW5zaXRpb25zXCIsXG4gIFwidGFnc1wiOiBbXCJjc3NcIl1cbn1cbiEqL1xuXG4gIE1vZGVybml6ci5hZGRUZXN0KCdjc3N0cmFuc2l0aW9ucycsIHRlc3RBbGxQcm9wcygndHJhbnNpdGlvbicsICdhbGwnLCB0cnVlKSk7XG5cbi8qIVxue1xuICBcIm5hbWVcIjogXCJDU1MgVHJhbnNmb3Jtc1wiLFxuICBcInByb3BlcnR5XCI6IFwiY3NzdHJhbnNmb3Jtc1wiLFxuICBcImNhbml1c2VcIjogXCJ0cmFuc2Zvcm1zMmRcIixcbiAgXCJ0YWdzXCI6IFtcImNzc1wiXVxufVxuISovXG5cbiAgTW9kZXJuaXpyLmFkZFRlc3QoJ2Nzc3RyYW5zZm9ybXMnLCBmdW5jdGlvbigpIHtcbiAgICAvLyBBbmRyb2lkIDwgMy4wIGlzIGJ1Z2d5LCBzbyB3ZSBzbmlmZiBhbmQgYmxhY2tsaXN0XG4gICAgLy8gaHR0cDovL2dpdC5pby9oSHpMN3dcbiAgICByZXR1cm4gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdBbmRyb2lkIDIuJykgPT09IC0xICYmXG4gICAgICAgICAgIHRlc3RBbGxQcm9wcygndHJhbnNmb3JtJywgJ3NjYWxlKDEpJywgdHJ1ZSk7XG4gIH0pO1xuXG5cbiAgLyoqXG4gICAqIE1vZGVybml6ci5oYXNFdmVudCgpIGRldGVjdHMgc3VwcG9ydCBmb3IgYSBnaXZlbiBldmVudFxuICAgKlxuICAgKiBAbWVtYmVyb2YgTW9kZXJuaXpyXG4gICAqIEBuYW1lIE1vZGVybml6ci5oYXNFdmVudFxuICAgKiBAb3B0aW9uTmFtZSBNb2Rlcm5penIuaGFzRXZlbnQoKVxuICAgKiBAb3B0aW9uUHJvcCBoYXNFdmVudFxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKiBAZnVuY3Rpb24gaGFzRXZlbnRcbiAgICogQHBhcmFtICB7c3RyaW5nfCp9IGV2ZW50TmFtZSAtIHRoZSBuYW1lIG9mIGFuIGV2ZW50IHRvIHRlc3QgZm9yIChlLmcuIFwicmVzaXplXCIpXG4gICAqIEBwYXJhbSAge0VsZW1lbnR8c3RyaW5nfSBbZWxlbWVudD1IVE1MRGl2RWxlbWVudF0gLSBpcyB0aGUgZWxlbWVudHxkb2N1bWVudHx3aW5kb3d8dGFnTmFtZSB0byB0ZXN0IG9uXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKiBAZXhhbXBsZVxuICAgKiAgYE1vZGVybml6ci5oYXNFdmVudGAgbGV0cyB5b3UgZGV0ZXJtaW5lIGlmIHRoZSBicm93c2VyIHN1cHBvcnRzIGEgc3VwcGxpZWQgZXZlbnQuXG4gICAqICBCeSBkZWZhdWx0LCBpdCBkb2VzIHRoaXMgZGV0ZWN0aW9uIG9uIGEgZGl2IGVsZW1lbnRcbiAgICpcbiAgICogYGBganNcbiAgICogIGhhc0V2ZW50KCdibHVyJykgLy8gdHJ1ZTtcbiAgICogYGBgXG4gICAqXG4gICAqIEhvd2V2ZXIsIHlvdSBhcmUgYWJsZSB0byBnaXZlIGFuIG9iamVjdCBhcyBhIHNlY29uZCBhcmd1bWVudCB0byBoYXNFdmVudCB0b1xuICAgKiBkZXRlY3QgYW4gZXZlbnQgb24gc29tZXRoaW5nIG90aGVyIHRoYW4gYSBkaXYuXG4gICAqXG4gICAqIGBgYGpzXG4gICAqICBoYXNFdmVudCgnZGV2aWNlbGlnaHQnLCB3aW5kb3cpIC8vIHRydWU7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cblxuICB2YXIgaGFzRXZlbnQgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICAvLyBEZXRlY3Qgd2hldGhlciBldmVudCBzdXBwb3J0IGNhbiBiZSBkZXRlY3RlZCB2aWEgYGluYC4gVGVzdCBvbiBhIERPTSBlbGVtZW50XG4gICAgLy8gdXNpbmcgdGhlIFwiYmx1clwiIGV2ZW50IGIvYyBpdCBzaG91bGQgYWx3YXlzIGV4aXN0LiBiaXQubHkvZXZlbnQtZGV0ZWN0aW9uXG4gICAgdmFyIG5lZWRzRmFsbGJhY2sgPSAhKCdvbmJsdXInIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG5cbiAgICBmdW5jdGlvbiBpbm5lcihldmVudE5hbWUsIGVsZW1lbnQpIHtcblxuICAgICAgdmFyIGlzU3VwcG9ydGVkO1xuICAgICAgaWYgKCFldmVudE5hbWUpIHsgcmV0dXJuIGZhbHNlOyB9XG4gICAgICBpZiAoIWVsZW1lbnQgfHwgdHlwZW9mIGVsZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQgfHwgJ2RpdicpO1xuICAgICAgfVxuXG4gICAgICAvLyBUZXN0aW5nIHZpYSB0aGUgYGluYCBvcGVyYXRvciBpcyBzdWZmaWNpZW50IGZvciBtb2Rlcm4gYnJvd3NlcnMgYW5kIElFLlxuICAgICAgLy8gV2hlbiB1c2luZyBgc2V0QXR0cmlidXRlYCwgSUUgc2tpcHMgXCJ1bmxvYWRcIiwgV2ViS2l0IHNraXBzIFwidW5sb2FkXCIgYW5kXG4gICAgICAvLyBcInJlc2l6ZVwiLCB3aGVyZWFzIGBpbmAgXCJjYXRjaGVzXCIgdGhvc2UuXG4gICAgICBldmVudE5hbWUgPSAnb24nICsgZXZlbnROYW1lO1xuICAgICAgaXNTdXBwb3J0ZWQgPSBldmVudE5hbWUgaW4gZWxlbWVudDtcblxuICAgICAgLy8gRmFsbGJhY2sgdGVjaG5pcXVlIGZvciBvbGQgRmlyZWZveCAtIGJpdC5seS9ldmVudC1kZXRlY3Rpb25cbiAgICAgIGlmICghaXNTdXBwb3J0ZWQgJiYgbmVlZHNGYWxsYmFjaykge1xuICAgICAgICBpZiAoIWVsZW1lbnQuc2V0QXR0cmlidXRlKSB7XG4gICAgICAgICAgLy8gU3dpdGNoIHRvIGdlbmVyaWMgZWxlbWVudCBpZiBpdCBsYWNrcyBgc2V0QXR0cmlidXRlYC5cbiAgICAgICAgICAvLyBJdCBjb3VsZCBiZSB0aGUgYGRvY3VtZW50YCwgYHdpbmRvd2AsIG9yIHNvbWV0aGluZyBlbHNlLlxuICAgICAgICAgIGVsZW1lbnQgPSBjcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKGV2ZW50TmFtZSwgJycpO1xuICAgICAgICBpc1N1cHBvcnRlZCA9IHR5cGVvZiBlbGVtZW50W2V2ZW50TmFtZV0gPT09ICdmdW5jdGlvbic7XG5cbiAgICAgICAgaWYgKGVsZW1lbnRbZXZlbnROYW1lXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgLy8gSWYgcHJvcGVydHkgd2FzIGNyZWF0ZWQsIFwicmVtb3ZlIGl0XCIgYnkgc2V0dGluZyB2YWx1ZSB0byBgdW5kZWZpbmVkYC5cbiAgICAgICAgICBlbGVtZW50W2V2ZW50TmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoZXZlbnROYW1lKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGlzU3VwcG9ydGVkO1xuICAgIH1cbiAgICByZXR1cm4gaW5uZXI7XG4gIH0pKCk7XG5cblxuICBNb2Rlcm5penJQcm90by5oYXNFdmVudCA9IGhhc0V2ZW50O1xuICBcbi8qIVxue1xuICBcIm5hbWVcIjogXCJIYXNoY2hhbmdlIGV2ZW50XCIsXG4gIFwicHJvcGVydHlcIjogXCJoYXNoY2hhbmdlXCIsXG4gIFwiY2FuaXVzZVwiOiBcImhhc2hjaGFuZ2VcIixcbiAgXCJ0YWdzXCI6IFtcImhpc3RvcnlcIl0sXG4gIFwibm90ZXNcIjogW3tcbiAgICBcIm5hbWVcIjogXCJNRE4gZG9jdW1lbnRhdGlvblwiLFxuICAgIFwiaHJlZlwiOiBcImh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS93aW5kb3cub25oYXNoY2hhbmdlXCJcbiAgfV0sXG4gIFwicG9seWZpbGxzXCI6IFtcbiAgICBcImpxdWVyeS1oYXNoY2hhbmdlXCIsXG4gICAgXCJtb28taGlzdG9yeW1hbmFnZXJcIixcbiAgICBcImpxdWVyeS1hamF4eVwiLFxuICAgIFwiaGFzaGVyXCIsXG4gICAgXCJzaGlzdG9yeVwiXG4gIF1cbn1cbiEqL1xuLyogRE9DXG5EZXRlY3RzIHN1cHBvcnQgZm9yIHRoZSBgaGFzaGNoYW5nZWAgZXZlbnQsIGZpcmVkIHdoZW4gdGhlIGN1cnJlbnQgbG9jYXRpb24gZnJhZ21lbnQgY2hhbmdlcy5cbiovXG5cbiAgTW9kZXJuaXpyLmFkZFRlc3QoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoaGFzRXZlbnQoJ2hhc2hjaGFuZ2UnLCB3aW5kb3cpID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIGRvY3VtZW50TW9kZSBsb2dpYyBmcm9tIFlVSSB0byBmaWx0ZXIgb3V0IElFOCBDb21wYXQgTW9kZVxuICAgIC8vICAgd2hpY2ggZmFsc2UgcG9zaXRpdmVzLlxuICAgIHJldHVybiAoZG9jdW1lbnQuZG9jdW1lbnRNb2RlID09PSB1bmRlZmluZWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRNb2RlID4gNyk7XG4gIH0pO1xuXG5cbiAgLyoqXG4gICAqIHNpbmNlIHdlIGhhdmUgYSBmYWlybHkgbGFyZ2UgbnVtYmVyIG9mIGlucHV0IHRlc3RzIHRoYXQgZG9uJ3QgbXV0YXRlIHRoZSBpbnB1dFxuICAgKiB3ZSBjcmVhdGUgYSBzaW5nbGUgZWxlbWVudCB0aGF0IGNhbiBiZSBzaGFyZWQgd2l0aCBhbGwgb2YgdGhvc2UgdGVzdHMgZm9yIGFcbiAgICogbWlub3IgcGVyZiBib29zdFxuICAgKlxuICAgKiBAYWNjZXNzIHByaXZhdGVcbiAgICogQHJldHVybnMge0hUTUxJbnB1dEVsZW1lbnR9XG4gICAqL1xuICB2YXIgaW5wdXRFbGVtID0gY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgXG4vKiFcbntcbiAgXCJuYW1lXCI6IFwiRm9ybSBpbnB1dCB0eXBlc1wiLFxuICBcInByb3BlcnR5XCI6IFwiaW5wdXR0eXBlc1wiLFxuICBcImNhbml1c2VcIjogXCJmb3Jtc1wiLFxuICBcInRhZ3NcIjogW1wiZm9ybXNcIl0sXG4gIFwiYXV0aG9yc1wiOiBbXCJNaWtlIFRheWxvclwiXSxcbiAgXCJwb2x5ZmlsbHNcIjogW1xuICAgIFwianF1ZXJ5dG9vbHNcIixcbiAgICBcIndlYnNoaW1zXCIsXG4gICAgXCJoNWZcIixcbiAgICBcIndlYmZvcm1zMlwiLFxuICAgIFwibnd4Zm9ybXNcIixcbiAgICBcImZkc2xpZGVyXCIsXG4gICAgXCJodG1sNXNsaWRlclwiLFxuICAgIFwiZ2FsbGVyeWh0bWw1Zm9ybXNcIixcbiAgICBcImpzY29sb3JcIixcbiAgICBcImh0bWw1Zm9ybXNoaW1cIixcbiAgICBcInNlbGVjdGVkb3B0aW9uc2pzXCIsXG4gICAgXCJmb3JtdmFsaWRhdGlvbmpzXCJcbiAgXVxufVxuISovXG4vKiBET0NcbkRldGVjdHMgc3VwcG9ydCBmb3IgSFRNTDUgZm9ybSBpbnB1dCB0eXBlcyBhbmQgZXhwb3NlcyBCb29sZWFuIHN1YnByb3BlcnRpZXMgd2l0aCB0aGUgcmVzdWx0czpcblxuYGBgamF2YXNjcmlwdFxuTW9kZXJuaXpyLmlucHV0dHlwZXMuY29sb3Jcbk1vZGVybml6ci5pbnB1dHR5cGVzLmRhdGVcbk1vZGVybml6ci5pbnB1dHR5cGVzLmRhdGV0aW1lXG5Nb2Rlcm5penIuaW5wdXR0eXBlc1snZGF0ZXRpbWUtbG9jYWwnXVxuTW9kZXJuaXpyLmlucHV0dHlwZXMuZW1haWxcbk1vZGVybml6ci5pbnB1dHR5cGVzLm1vbnRoXG5Nb2Rlcm5penIuaW5wdXR0eXBlcy5udW1iZXJcbk1vZGVybml6ci5pbnB1dHR5cGVzLnJhbmdlXG5Nb2Rlcm5penIuaW5wdXR0eXBlcy5zZWFyY2hcbk1vZGVybml6ci5pbnB1dHR5cGVzLnRlbFxuTW9kZXJuaXpyLmlucHV0dHlwZXMudGltZVxuTW9kZXJuaXpyLmlucHV0dHlwZXMudXJsXG5Nb2Rlcm5penIuaW5wdXR0eXBlcy53ZWVrXG5gYGBcbiovXG5cbiAgLy8gUnVuIHRocm91Z2ggSFRNTDUncyBuZXcgaW5wdXQgdHlwZXMgdG8gc2VlIGlmIHRoZSBVQSB1bmRlcnN0YW5kcyBhbnkuXG4gIC8vICAgVGhpcyBpcyBwdXQgYmVoaW5kIHRoZSB0ZXN0cyBydW5sb29wIGJlY2F1c2UgaXQgZG9lc24ndCByZXR1cm4gYVxuICAvLyAgIHRydWUvZmFsc2UgbGlrZSBhbGwgdGhlIG90aGVyIHRlc3RzOyBpbnN0ZWFkLCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICAvLyAgIGNvbnRhaW5pbmcgZWFjaCBpbnB1dCB0eXBlIHdpdGggaXRzIGNvcnJlc3BvbmRpbmcgdHJ1ZS9mYWxzZSB2YWx1ZVxuXG4gIC8vIEJpZyB0aGFua3MgdG8gQG1pa2V0YXlsciBmb3IgdGhlIGh0bWw1IGZvcm1zIGV4cGVydGlzZS4gbWlrZXRheWxyLmNvbS9cbiAgdmFyIGlucHV0dHlwZXMgPSAnc2VhcmNoIHRlbCB1cmwgZW1haWwgZGF0ZXRpbWUgZGF0ZSBtb250aCB3ZWVrIHRpbWUgZGF0ZXRpbWUtbG9jYWwgbnVtYmVyIHJhbmdlIGNvbG9yJy5zcGxpdCgnICcpO1xuICB2YXIgaW5wdXRzID0ge307XG5cbiAgTW9kZXJuaXpyLmlucHV0dHlwZXMgPSAoZnVuY3Rpb24ocHJvcHMpIHtcbiAgICB2YXIgbGVuID0gcHJvcHMubGVuZ3RoO1xuICAgIHZhciBzbWlsZSA9ICcxKSc7XG4gICAgdmFyIGlucHV0RWxlbVR5cGU7XG4gICAgdmFyIGRlZmF1bHRWaWV3O1xuICAgIHZhciBib29sO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuXG4gICAgICBpbnB1dEVsZW0uc2V0QXR0cmlidXRlKCd0eXBlJywgaW5wdXRFbGVtVHlwZSA9IHByb3BzW2ldKTtcbiAgICAgIGJvb2wgPSBpbnB1dEVsZW0udHlwZSAhPT0gJ3RleHQnICYmICdzdHlsZScgaW4gaW5wdXRFbGVtO1xuXG4gICAgICAvLyBXZSBmaXJzdCBjaGVjayB0byBzZWUgaWYgdGhlIHR5cGUgd2UgZ2l2ZSBpdCBzdGlja3MuLlxuICAgICAgLy8gSWYgdGhlIHR5cGUgZG9lcywgd2UgZmVlZCBpdCBhIHRleHR1YWwgdmFsdWUsIHdoaWNoIHNob3VsZG4ndCBiZSB2YWxpZC5cbiAgICAgIC8vIElmIHRoZSB2YWx1ZSBkb2Vzbid0IHN0aWNrLCB3ZSBrbm93IHRoZXJlJ3MgaW5wdXQgc2FuaXRpemF0aW9uIHdoaWNoIGluZmVycyBhIGN1c3RvbSBVSVxuICAgICAgaWYgKGJvb2wpIHtcblxuICAgICAgICBpbnB1dEVsZW0udmFsdWUgICAgICAgICA9IHNtaWxlO1xuICAgICAgICBpbnB1dEVsZW0uc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTt2aXNpYmlsaXR5OmhpZGRlbjsnO1xuXG4gICAgICAgIGlmICgvXnJhbmdlJC8udGVzdChpbnB1dEVsZW1UeXBlKSAmJiBpbnB1dEVsZW0uc3R5bGUuV2Via2l0QXBwZWFyYW5jZSAhPT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICBkb2NFbGVtZW50LmFwcGVuZENoaWxkKGlucHV0RWxlbSk7XG4gICAgICAgICAgZGVmYXVsdFZpZXcgPSBkb2N1bWVudC5kZWZhdWx0VmlldztcblxuICAgICAgICAgIC8vIFNhZmFyaSAyLTQgYWxsb3dzIHRoZSBzbWlsZXkgYXMgYSB2YWx1ZSwgZGVzcGl0ZSBtYWtpbmcgYSBzbGlkZXJcbiAgICAgICAgICBib29sID0gIGRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUgJiZcbiAgICAgICAgICAgIGRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoaW5wdXRFbGVtLCBudWxsKS5XZWJraXRBcHBlYXJhbmNlICE9PSAndGV4dGZpZWxkJyAmJlxuICAgICAgICAgICAgLy8gTW9iaWxlIGFuZHJvaWQgd2ViIGJyb3dzZXIgaGFzIGZhbHNlIHBvc2l0aXZlLCBzbyBtdXN0XG4gICAgICAgICAgICAvLyBjaGVjayB0aGUgaGVpZ2h0IHRvIHNlZSBpZiB0aGUgd2lkZ2V0IGlzIGFjdHVhbGx5IHRoZXJlLlxuICAgICAgICAgICAgKGlucHV0RWxlbS5vZmZzZXRIZWlnaHQgIT09IDApO1xuXG4gICAgICAgICAgZG9jRWxlbWVudC5yZW1vdmVDaGlsZChpbnB1dEVsZW0pO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoL14oc2VhcmNofHRlbCkkLy50ZXN0KGlucHV0RWxlbVR5cGUpKSB7XG4gICAgICAgICAgLy8gU3BlYyBkb2Vzbid0IGRlZmluZSBhbnkgc3BlY2lhbCBwYXJzaW5nIG9yIGRldGVjdGFibGUgVUlcbiAgICAgICAgICAvLyAgIGJlaGF2aW9ycyBzbyB3ZSBwYXNzIHRoZXNlIHRocm91Z2ggYXMgdHJ1ZVxuXG4gICAgICAgICAgLy8gSW50ZXJlc3RpbmdseSwgb3BlcmEgZmFpbHMgdGhlIGVhcmxpZXIgdGVzdCwgc28gaXQgZG9lc24ndFxuICAgICAgICAgIC8vICBldmVuIG1ha2UgaXQgaGVyZS5cblxuICAgICAgICB9IGVsc2UgaWYgKC9eKHVybHxlbWFpbCkkLy50ZXN0KGlucHV0RWxlbVR5cGUpKSB7XG4gICAgICAgICAgLy8gUmVhbCB1cmwgYW5kIGVtYWlsIHN1cHBvcnQgY29tZXMgd2l0aCBwcmViYWtlZCB2YWxpZGF0aW9uLlxuICAgICAgICAgIGJvb2wgPSBpbnB1dEVsZW0uY2hlY2tWYWxpZGl0eSAmJiBpbnB1dEVsZW0uY2hlY2tWYWxpZGl0eSgpID09PSBmYWxzZTtcblxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIHRoZSB1cGdyYWRlZCBpbnB1dCBjb21wb250ZW50IHJlamVjdHMgdGhlIDopIHRleHQsIHdlIGdvdCBhIHdpbm5lclxuICAgICAgICAgIGJvb2wgPSBpbnB1dEVsZW0udmFsdWUgIT0gc21pbGU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5wdXRzWyBwcm9wc1tpXSBdID0gISFib29sO1xuICAgIH1cbiAgICByZXR1cm4gaW5wdXRzO1xuICB9KShpbnB1dHR5cGVzKTtcblxuXG4gIC8qKlxuICAgKiBhdFJ1bGUgcmV0dXJucyBhIGdpdmVuIENTUyBwcm9wZXJ0eSBhdC1ydWxlIChlZyBAa2V5ZnJhbWVzKSwgcG9zc2libHkgaW5cbiAgICogc29tZSBwcmVmaXhlZCBmb3JtLCBvciBmYWxzZSwgaW4gdGhlIGNhc2Ugb2YgYW4gdW5zdXBwb3J0ZWQgcnVsZVxuICAgKlxuICAgKiBAbWVtYmVyb2YgTW9kZXJuaXpyXG4gICAqIEBuYW1lIE1vZGVybml6ci5hdFJ1bGVcbiAgICogQG9wdGlvbk5hbWUgTW9kZXJuaXpyLmF0UnVsZSgpXG4gICAqIEBvcHRpb25Qcm9wIGF0UnVsZVxuICAgKiBAYWNjZXNzIHB1YmxpY1xuICAgKiBAZnVuY3Rpb24gYXRSdWxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wIC0gU3RyaW5nIG5hbWUgb2YgdGhlIEAtcnVsZSB0byB0ZXN0IGZvclxuICAgKiBAcmV0dXJucyB7c3RyaW5nfGJvb2xlYW59IFRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSAocG9zc2libHkgcHJlZml4ZWQpXG4gICAqIHZhbGlkIHZlcnNpb24gb2YgdGhlIEAtcnVsZSwgb3IgYGZhbHNlYCB3aGVuIGl0IGlzIHVuc3VwcG9ydGVkLlxuICAgKiBAZXhhbXBsZVxuICAgKiBgYGBqc1xuICAgKiAgdmFyIGtleWZyYW1lcyA9IE1vZGVybml6ci5hdFJ1bGUoJ0BrZXlmcmFtZXMnKTtcbiAgICpcbiAgICogIGlmIChrZXlmcmFtZXMpIHtcbiAgICogICAgLy8ga2V5ZnJhbWVzIGFyZSBzdXBwb3J0ZWRcbiAgICogICAgLy8gY291bGQgYmUgYEAtd2Via2l0LWtleWZyYW1lc2Agb3IgYEBrZXlmcmFtZXNgXG4gICAqICB9IGVsc2Uge1xuICAgKiAgICAvLyBrZXlmcmFtZXMgPT09IGBmYWxzZWBcbiAgICogIH1cbiAgICogYGBgXG4gICAqXG4gICAqL1xuXG4gIHZhciBhdFJ1bGUgPSBmdW5jdGlvbihwcm9wKSB7XG4gICAgdmFyIGxlbmd0aCA9IHByZWZpeGVzLmxlbmd0aDtcbiAgICB2YXIgY3NzcnVsZSA9IHdpbmRvdy5DU1NSdWxlO1xuICAgIHZhciBydWxlO1xuXG4gICAgaWYgKHR5cGVvZiBjc3NydWxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAoIXByb3ApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyByZW1vdmUgbGl0ZXJhbCBAIGZyb20gYmVnaW5uaW5nIG9mIHByb3ZpZGVkIHByb3BlcnR5XG4gICAgcHJvcCA9IHByb3AucmVwbGFjZSgvXkAvLCAnJyk7XG5cbiAgICAvLyBDU1NSdWxlcyB1c2UgdW5kZXJzY29yZXMgaW5zdGVhZCBvZiBkYXNoZXNcbiAgICBydWxlID0gcHJvcC5yZXBsYWNlKC8tL2csICdfJykudG9VcHBlckNhc2UoKSArICdfUlVMRSc7XG5cbiAgICBpZiAocnVsZSBpbiBjc3NydWxlKSB7XG4gICAgICByZXR1cm4gJ0AnICsgcHJvcDtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBwcmVmaXhlcyBnaXZlcyB1cyBzb21ldGhpbmcgbGlrZSAtby0sIGFuZCB3ZSB3YW50IE9fXG4gICAgICB2YXIgcHJlZml4ID0gcHJlZml4ZXNbaV07XG4gICAgICB2YXIgdGhpc1J1bGUgPSBwcmVmaXgudG9VcHBlckNhc2UoKSArICdfJyArIHJ1bGU7XG5cbiAgICAgIGlmICh0aGlzUnVsZSBpbiBjc3NydWxlKSB7XG4gICAgICAgIHJldHVybiAnQC0nICsgcHJlZml4LnRvTG93ZXJDYXNlKCkgKyAnLScgKyBwcm9wO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICBNb2Rlcm5penJQcm90by5hdFJ1bGUgPSBhdFJ1bGU7XG5cbiAgXG5cbiAgLyoqXG4gICAqIHByZWZpeGVkIHJldHVybnMgdGhlIHByZWZpeGVkIG9yIG5vbnByZWZpeGVkIHByb3BlcnR5IG5hbWUgdmFyaWFudCBvZiB5b3VyIGlucHV0XG4gICAqXG4gICAqIEBtZW1iZXJvZiBNb2Rlcm5penJcbiAgICogQG5hbWUgTW9kZXJuaXpyLnByZWZpeGVkXG4gICAqIEBvcHRpb25OYW1lIE1vZGVybml6ci5wcmVmaXhlZCgpXG4gICAqIEBvcHRpb25Qcm9wIHByZWZpeGVkXG4gICAqIEBhY2Nlc3MgcHVibGljXG4gICAqIEBmdW5jdGlvbiBwcmVmaXhlZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcHJvcCAtIFN0cmluZyBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byB0ZXN0IGZvclxuICAgKiBAcGFyYW0ge29iamVjdH0gW29ial0gLSBBbiBvYmplY3QgdG8gdGVzdCBmb3IgdGhlIHByZWZpeGVkIHByb3BlcnRpZXMgb25cbiAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW2VsZW1dIC0gQW4gZWxlbWVudCB1c2VkIHRvIHRlc3Qgc3BlY2lmaWMgcHJvcGVydGllcyBhZ2FpbnN0XG4gICAqIEByZXR1cm5zIHtzdHJpbmd8ZmFsc2V9IFRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSAocG9zc2libHkgcHJlZml4ZWQpIHZhbGlkXG4gICAqIHZlcnNpb24gb2YgdGhlIHByb3BlcnR5LCBvciBgZmFsc2VgIHdoZW4gaXQgaXMgdW5zdXBwb3J0ZWQuXG4gICAqIEBleGFtcGxlXG4gICAqXG4gICAqIE1vZGVybml6ci5wcmVmaXhlZCB0YWtlcyBhIHN0cmluZyBjc3MgdmFsdWUgaW4gdGhlIERPTSBzdHlsZSBjYW1lbENhc2UgKGFzXG4gICAqIG9wcG9zZWQgdG8gdGhlIGNzcyBzdHlsZSBrZWJhYi1jYXNlKSBmb3JtIGFuZCByZXR1cm5zIHRoZSAocG9zc2libHkgcHJlZml4ZWQpXG4gICAqIHZlcnNpb24gb2YgdGhhdCBwcm9wZXJ0eSB0aGF0IHRoZSBicm93c2VyIGFjdHVhbGx5IHN1cHBvcnRzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgaW4gb2xkZXIgRmlyZWZveC4uLlxuICAgKiBgYGBqc1xuICAgKiBwcmVmaXhlZCgnYm94U2l6aW5nJylcbiAgICogYGBgXG4gICAqIHJldHVybnMgJ01vekJveFNpemluZydcbiAgICpcbiAgICogSW4gbmV3ZXIgRmlyZWZveCwgYXMgd2VsbCBhcyBhbnkgb3RoZXIgYnJvd3NlciB0aGF0IHN1cHBvcnQgdGhlIHVucHJlZml4ZWRcbiAgICogdmVyc2lvbiB3b3VsZCBzaW1wbHkgcmV0dXJuIGBib3hTaXppbmdgLiBBbnkgYnJvd3NlciB0aGF0IGRvZXMgbm90IHN1cHBvcnRcbiAgICogdGhlIHByb3BlcnR5IGF0IGFsbCwgaXQgd2lsbCByZXR1cm4gYGZhbHNlYC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgcHJlZml4ZWQgaXMgY2hlY2tlZCBhZ2FpbnN0IGEgRE9NIGVsZW1lbnQuIElmIHlvdSB3YW50IHRvIGNoZWNrXG4gICAqIGZvciBhIHByb3BlcnR5IG9uIGFub3RoZXIgb2JqZWN0LCBqdXN0IHBhc3MgaXQgYXMgYSBzZWNvbmQgYXJndW1lbnRcbiAgICpcbiAgICogYGBganNcbiAgICogdmFyIHJBRiA9IHByZWZpeGVkKCdyZXF1ZXN0QW5pbWF0aW9uRnJhbWUnLCB3aW5kb3cpO1xuICAgKlxuICAgKiByYWYoZnVuY3Rpb24oKSB7XG4gICAqICByZW5kZXJGdW5jdGlvbigpO1xuICAgKiB9KVxuICAgKiBgYGBcbiAgICpcbiAgICogTm90ZSB0aGF0IHRoaXMgd2lsbCByZXR1cm4gX3RoZSBhY3R1YWwgZnVuY3Rpb25fIC0gbm90IHRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbi5cbiAgICogSWYgeW91IG5lZWQgdGhlIGFjdHVhbCBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgcGFzcyBpbiBgZmFsc2VgIGFzIGEgdGhpcmQgYXJndW1lbnRcbiAgICpcbiAgICogYGBganNcbiAgICogdmFyIHJBRlByb3AgPSBwcmVmaXhlZCgncmVxdWVzdEFuaW1hdGlvbkZyYW1lJywgd2luZG93LCBmYWxzZSk7XG4gICAqXG4gICAqIHJhZlByb3AgPT09ICdXZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnIC8vIGluIG9sZGVyIHdlYmtpdFxuICAgKiBgYGBcbiAgICpcbiAgICogT25lIGNvbW1vbiB1c2UgY2FzZSBmb3IgcHJlZml4ZWQgaXMgaWYgeW91J3JlIHRyeWluZyB0byBkZXRlcm1pbmUgd2hpY2ggdHJhbnNpdGlvblxuICAgKiBlbmQgZXZlbnQgdG8gYmluZCB0bywgeW91IG1pZ2h0IGRvIHNvbWV0aGluZyBsaWtlLi4uXG4gICAqIGBgYGpzXG4gICAqIHZhciB0cmFuc0VuZEV2ZW50TmFtZXMgPSB7XG4gICAqICAgICAnV2Via2l0VHJhbnNpdGlvbicgOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsICogU2FmIDYsIEFuZHJvaWQgQnJvd3NlclxuICAgKiAgICAgJ01velRyYW5zaXRpb24nICAgIDogJ3RyYW5zaXRpb25lbmQnLCAgICAgICAqIG9ubHkgZm9yIEZGIDwgMTVcbiAgICogICAgICd0cmFuc2l0aW9uJyAgICAgICA6ICd0cmFuc2l0aW9uZW5kJyAgICAgICAgKiBJRTEwLCBPcGVyYSwgQ2hyb21lLCBGRiAxNSssIFNhZiA3K1xuICAgKiB9O1xuICAgKlxuICAgKiB2YXIgdHJhbnNFbmRFdmVudE5hbWUgPSB0cmFuc0VuZEV2ZW50TmFtZXNbIE1vZGVybml6ci5wcmVmaXhlZCgndHJhbnNpdGlvbicpIF07XG4gICAqIGBgYFxuICAgKlxuICAgKiBJZiB5b3Ugd2FudCBhIHNpbWlsYXIgbG9va3VwLCBidXQgaW4ga2ViYWItY2FzZSwgeW91IGNhbiB1c2UgW3ByZWZpeGVkQ1NTXSgjbW9kZXJuaXpyLXByZWZpeGVkY3NzKS5cbiAgICovXG5cbiAgdmFyIHByZWZpeGVkID0gTW9kZXJuaXpyUHJvdG8ucHJlZml4ZWQgPSBmdW5jdGlvbihwcm9wLCBvYmosIGVsZW0pIHtcbiAgICBpZiAocHJvcC5pbmRleE9mKCdAJykgPT09IDApIHtcbiAgICAgIHJldHVybiBhdFJ1bGUocHJvcCk7XG4gICAgfVxuXG4gICAgaWYgKHByb3AuaW5kZXhPZignLScpICE9IC0xKSB7XG4gICAgICAvLyBDb252ZXJ0IGtlYmFiLWNhc2UgdG8gY2FtZWxDYXNlXG4gICAgICBwcm9wID0gY3NzVG9ET00ocHJvcCk7XG4gICAgfVxuICAgIGlmICghb2JqKSB7XG4gICAgICByZXR1cm4gdGVzdFByb3BzQWxsKHByb3AsICdwZngnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGVzdGluZyBET00gcHJvcGVydHkgZS5nLiBNb2Rlcm5penIucHJlZml4ZWQoJ3JlcXVlc3RBbmltYXRpb25GcmFtZScsIHdpbmRvdykgLy8gJ21velJlcXVlc3RBbmltYXRpb25GcmFtZSdcbiAgICAgIHJldHVybiB0ZXN0UHJvcHNBbGwocHJvcCwgb2JqLCBlbGVtKTtcbiAgICB9XG4gIH07XG5cbiAgXG4vKiFcbntcbiAgXCJuYW1lXCI6IFwiQ1NTIE9iamVjdCBGaXRcIixcbiAgXCJjYW5pdXNlXCI6IFwib2JqZWN0LWZpdFwiLFxuICBcInByb3BlcnR5XCI6IFwib2JqZWN0Zml0XCIsXG4gIFwidGFnc1wiOiBbXCJjc3NcIl0sXG4gIFwiYnVpbGRlckFsaWFzZXNcIjogW1wiY3NzX29iamVjdGZpdFwiXSxcbiAgXCJub3Rlc1wiOiBbe1xuICAgIFwibmFtZVwiOiBcIk9wZXJhIEFydGljbGUgb24gT2JqZWN0IEZpdFwiLFxuICAgIFwiaHJlZlwiOiBcImh0dHBzOi8vZGV2Lm9wZXJhLmNvbS9hcnRpY2xlcy9jc3MzLW9iamVjdC1maXQtb2JqZWN0LXBvc2l0aW9uL1wiXG4gIH1dXG59XG4hKi9cblxuICBNb2Rlcm5penIuYWRkVGVzdCgnb2JqZWN0Zml0JywgISFwcmVmaXhlZCgnb2JqZWN0Rml0JyksIHthbGlhc2VzOiBbJ29iamVjdC1maXQnXX0pO1xuXG5cbiAgLy8gUnVuIGVhY2ggdGVzdFxuICB0ZXN0UnVubmVyKCk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBcIm5vLWpzXCIgY2xhc3MgaWYgaXQgZXhpc3RzXG4gIHNldENsYXNzZXMoY2xhc3Nlcyk7XG5cbiAgZGVsZXRlIE1vZGVybml6clByb3RvLmFkZFRlc3Q7XG4gIGRlbGV0ZSBNb2Rlcm5penJQcm90by5hZGRBc3luY1Rlc3Q7XG5cbiAgLy8gUnVuIHRoZSB0aGluZ3MgdGhhdCBhcmUgc3VwcG9zZWQgdG8gcnVuIGFmdGVyIHRoZSB0ZXN0c1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE1vZGVybml6ci5fcS5sZW5ndGg7IGkrKykge1xuICAgIE1vZGVybml6ci5fcVtpXSgpO1xuICB9XG5cbiAgLy8gTGVhayBNb2Rlcm5penIgbmFtZXNwYWNlXG4gIHdpbmRvdy5Nb2Rlcm5penIgPSBNb2Rlcm5penI7XG5cblxuO1xuXG59KSh3aW5kb3csIGRvY3VtZW50KTsiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxNiBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7XG4gKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG4vKiEgYXV0b3RyYWNrLmpzIHYwLjYuNSAqL1xuIWZ1bmN0aW9uIHQoZSxpLG4pe2Z1bmN0aW9uIHIobyxzKXtpZighaVtvXSl7aWYoIWVbb10pe3ZhciBsPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIXMmJmwpcmV0dXJuIGwobywhMCk7aWYoYSlyZXR1cm4gYShvLCEwKTt2YXIgdT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IHUuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIix1fXZhciBkPWlbb109e2V4cG9ydHM6e319O2Vbb11bMF0uY2FsbChkLmV4cG9ydHMsZnVuY3Rpb24odCl7dmFyIGk9ZVtvXVsxXVt0XTtyZXR1cm4gcihpP2k6dCl9LGQsZC5leHBvcnRzLHQsZSxpLG4pfXJldHVybiBpW29dLmV4cG9ydHN9Zm9yKHZhciBhPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsbz0wO288bi5sZW5ndGg7bysrKXIobltvXSk7cmV0dXJuIHJ9KHsxOltmdW5jdGlvbih0LGUsaSl7ZS5leHBvcnRzPXtERVZfSUQ6XCJpNWlTam9cIn19LHt9XSwyOltmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0LGUpe2lmKHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKXt0aGlzLm9wdHM9YShlLHthdHRyaWJ1dGVQcmVmaXg6XCJkYXRhLVwifSksdGhpcy50cmFja2VyPXQ7dmFyIGk9dGhpcy5vcHRzLmF0dHJpYnV0ZVByZWZpeCxuPVwiW1wiK2krXCJldmVudC1jYXRlZ29yeV1bXCIraStcImV2ZW50LWFjdGlvbl1cIjt0aGlzLmRlbGVnYXRlPXIoZG9jdW1lbnQsbixcImNsaWNrXCIsdGhpcy5oYW5kbGVFdmVudENsaWNrcy5iaW5kKHRoaXMpKX19dmFyIHI9dChcImRlbGVnYXRlXCIpLGE9dChcIi4uL3V0aWxpdGllc1wiKS5kZWZhdWx0cyxvPXQoXCIuLi9wcm92aWRlXCIpO24ucHJvdG90eXBlLmhhbmRsZUV2ZW50Q2xpY2tzPWZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVsZWdhdGVUYXJnZXQsaT10aGlzLm9wdHMuYXR0cmlidXRlUHJlZml4O3RoaXMudHJhY2tlci5zZW5kKFwiZXZlbnRcIix7ZXZlbnRDYXRlZ29yeTplLmdldEF0dHJpYnV0ZShpK1wiZXZlbnQtY2F0ZWdvcnlcIiksZXZlbnRBY3Rpb246ZS5nZXRBdHRyaWJ1dGUoaStcImV2ZW50LWFjdGlvblwiKSxldmVudExhYmVsOmUuZ2V0QXR0cmlidXRlKGkrXCJldmVudC1sYWJlbFwiKSxldmVudFZhbHVlOmUuZ2V0QXR0cmlidXRlKGkrXCJldmVudC12YWx1ZVwiKX0pfSxuLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oKXt0aGlzLmRlbGVnYXRlLmRlc3Ryb3koKSx0aGlzLmRlbGVnYXRlPW51bGwsdGhpcy50cmFja2VyPW51bGwsdGhpcy5vcHRzPW51bGx9LG8oXCJldmVudFRyYWNrZXJcIixuKX0se1wiLi4vcHJvdmlkZVwiOjgsXCIuLi91dGlsaXRpZXNcIjo5LGRlbGVnYXRlOjEzfV0sMzpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCxlKXt3aW5kb3cubWF0Y2hNZWRpYSYmKHRoaXMub3B0cz1vKGUse21lZGlhUXVlcnlEZWZpbml0aW9uczohMSxtZWRpYVF1ZXJ5Q2hhbmdlVGVtcGxhdGU6dGhpcy5jaGFuZ2VUZW1wbGF0ZSxtZWRpYVF1ZXJ5Q2hhbmdlVGltZW91dDoxZTN9KSxzKHRoaXMub3B0cy5tZWRpYVF1ZXJ5RGVmaW5pdGlvbnMpJiYodGhpcy5vcHRzLm1lZGlhUXVlcnlEZWZpbml0aW9ucz1sKHRoaXMub3B0cy5tZWRpYVF1ZXJ5RGVmaW5pdGlvbnMpLHRoaXMudHJhY2tlcj10LHRoaXMuY2hhbmdlTGlzdGVuZXJzPVtdLHRoaXMucHJvY2Vzc01lZGlhUXVlcmllcygpKSl9ZnVuY3Rpb24gcih0KXtyZXR1cm4gY1t0XT9jW3RdOihjW3RdPXdpbmRvdy5tYXRjaE1lZGlhKHQpLGNbdF0pfXZhciBhPXQoXCJkZWJvdW5jZVwiKSxvPXQoXCIuLi91dGlsaXRpZXNcIikuZGVmYXVsdHMscz10KFwiLi4vdXRpbGl0aWVzXCIpLmlzT2JqZWN0LGw9dChcIi4uL3V0aWxpdGllc1wiKS50b0FycmF5LHU9dChcIi4uL3Byb3ZpZGVcIiksZD1cIihub3Qgc2V0KVwiLGM9e307bi5wcm90b3R5cGUucHJvY2Vzc01lZGlhUXVlcmllcz1mdW5jdGlvbigpe3RoaXMub3B0cy5tZWRpYVF1ZXJ5RGVmaW5pdGlvbnMuZm9yRWFjaChmdW5jdGlvbih0KXtpZih0Lm5hbWUmJnQuZGltZW5zaW9uSW5kZXgpe3ZhciBlPXRoaXMuZ2V0TWF0Y2hOYW1lKHQpO3RoaXMudHJhY2tlci5zZXQoXCJkaW1lbnNpb25cIit0LmRpbWVuc2lvbkluZGV4LGUpLHRoaXMuYWRkQ2hhbmdlTGlzdGVuZXJzKHQpfX0uYmluZCh0aGlzKSl9LG4ucHJvdG90eXBlLmdldE1hdGNoTmFtZT1mdW5jdGlvbih0KXt2YXIgZTtyZXR1cm4gdC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3IodC5tZWRpYSkubWF0Y2hlcyYmKGU9dCl9KSxlP2UubmFtZTpkfSxuLnByb3RvdHlwZS5hZGRDaGFuZ2VMaXN0ZW5lcnM9ZnVuY3Rpb24odCl7dC5pdGVtcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3ZhciBpPXIoZS5tZWRpYSksbj1hKGZ1bmN0aW9uKCl7dGhpcy5oYW5kbGVDaGFuZ2VzKHQpfS5iaW5kKHRoaXMpLHRoaXMub3B0cy5tZWRpYVF1ZXJ5Q2hhbmdlVGltZW91dCk7aS5hZGRMaXN0ZW5lcihuKSx0aGlzLmNoYW5nZUxpc3RlbmVycy5wdXNoKHttcWw6aSxmbjpufSl9LmJpbmQodGhpcykpfSxuLnByb3RvdHlwZS5oYW5kbGVDaGFuZ2VzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0TWF0Y2hOYW1lKHQpLGk9dGhpcy50cmFja2VyLmdldChcImRpbWVuc2lvblwiK3QuZGltZW5zaW9uSW5kZXgpO2UhPT1pJiYodGhpcy50cmFja2VyLnNldChcImRpbWVuc2lvblwiK3QuZGltZW5zaW9uSW5kZXgsZSksdGhpcy50cmFja2VyLnNlbmQoXCJldmVudFwiLHQubmFtZSxcImNoYW5nZVwiLHRoaXMub3B0cy5tZWRpYVF1ZXJ5Q2hhbmdlVGVtcGxhdGUoaSxlKSkpfSxuLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oKXtmb3IodmFyIHQsZT0wO3Q9dGhpcy5jaGFuZ2VMaXN0ZW5lcnNbZV07ZSsrKXQubXFsLnJlbW92ZUxpc3RlbmVyKHQuZm4pO3RoaXMuY2hhbmdlTGlzdGVuZXJzPW51bGwsdGhpcy50cmFja2VyPW51bGwsdGhpcy5vcHRzPW51bGx9LG4ucHJvdG90eXBlLmNoYW5nZVRlbXBsYXRlPWZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQrXCIgPT4gXCIrZX0sdShcIm1lZGlhUXVlcnlUcmFja2VyXCIsbil9LHtcIi4uL3Byb3ZpZGVcIjo4LFwiLi4vdXRpbGl0aWVzXCI6OSxkZWJvdW5jZToxMn1dLDQ6W2Z1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQsZSl7d2luZG93LmFkZEV2ZW50TGlzdGVuZXImJih0aGlzLm9wdHM9cihlLHtzaG91bGRUcmFja091dGJvdW5kRm9ybTp0aGlzLnNob3VsZFRyYWNrT3V0Ym91bmRGb3JtfSksdGhpcy50cmFja2VyPXQsdGhpcy5kZWxlZ2F0ZT1hKGRvY3VtZW50LFwiZm9ybVwiLFwic3VibWl0XCIsdGhpcy5oYW5kbGVGb3JtU3VibWl0cy5iaW5kKHRoaXMpKSl9dmFyIHI9dChcIi4uL3V0aWxpdGllc1wiKS5kZWZhdWx0cyxhPXQoXCJkZWxlZ2F0ZVwiKSxvPXQoXCIuLi9wcm92aWRlXCIpLHM9dChcIi4uL3V0aWxpdGllc1wiKTtuLnByb3RvdHlwZS5oYW5kbGVGb3JtU3VibWl0cz1mdW5jdGlvbih0KXt2YXIgZT10LmRlbGVnYXRlVGFyZ2V0LGk9ZS5nZXRBdHRyaWJ1dGUoXCJhY3Rpb25cIiksbj17dHJhbnNwb3J0OlwiYmVhY29uXCJ9O3RoaXMub3B0cy5zaG91bGRUcmFja091dGJvdW5kRm9ybShlKSYmKG5hdmlnYXRvci5zZW5kQmVhY29ufHwodC5wcmV2ZW50RGVmYXVsdCgpLG4uaGl0Q2FsbGJhY2s9cy53aXRoVGltZW91dChmdW5jdGlvbigpe2Uuc3VibWl0KCl9KSksdGhpcy50cmFja2VyLnNlbmQoXCJldmVudFwiLFwiT3V0Ym91bmQgRm9ybVwiLFwic3VibWl0XCIsaSxuKSl9LG4ucHJvdG90eXBlLnNob3VsZFRyYWNrT3V0Ym91bmRGb3JtPWZ1bmN0aW9uKHQpe3ZhciBlPXQuZ2V0QXR0cmlidXRlKFwiYWN0aW9uXCIpO3JldHVybiBlJiYwPT09ZS5pbmRleE9mKFwiaHR0cFwiKSYmZS5pbmRleE9mKGxvY2F0aW9uLmhvc3RuYW1lKTwwfSxuLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oKXt0aGlzLmRlbGVnYXRlLmRlc3Ryb3koKSx0aGlzLmRlbGVnYXRlPW51bGwsdGhpcy50cmFja2VyPW51bGwsdGhpcy5vcHRzPW51bGx9LG8oXCJvdXRib3VuZEZvcm1UcmFja2VyXCIsbil9LHtcIi4uL3Byb3ZpZGVcIjo4LFwiLi4vdXRpbGl0aWVzXCI6OSxkZWxlZ2F0ZToxM31dLDU6W2Z1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQsZSl7d2luZG93LmFkZEV2ZW50TGlzdGVuZXImJih0aGlzLm9wdHM9cihlLHtzaG91bGRUcmFja091dGJvdW5kTGluazp0aGlzLnNob3VsZFRyYWNrT3V0Ym91bmRMaW5rfSksdGhpcy50cmFja2VyPXQsdGhpcy5kZWxlZ2F0ZT1hKGRvY3VtZW50LFwiYVwiLFwiY2xpY2tcIix0aGlzLmhhbmRsZUxpbmtDbGlja3MuYmluZCh0aGlzKSkpfXZhciByPXQoXCIuLi91dGlsaXRpZXNcIikuZGVmYXVsdHMsYT10KFwiZGVsZWdhdGVcIiksbz10KFwiLi4vcHJvdmlkZVwiKTtuLnByb3RvdHlwZS5oYW5kbGVMaW5rQ2xpY2tzPWZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVsZWdhdGVUYXJnZXQ7dGhpcy5vcHRzLnNob3VsZFRyYWNrT3V0Ym91bmRMaW5rKGUpJiYobmF2aWdhdG9yLnNlbmRCZWFjb258fChlLnRhcmdldD1cIl9ibGFua1wiKSx0aGlzLnRyYWNrZXIuc2VuZChcImV2ZW50XCIsXCJPdXRib3VuZCBMaW5rXCIsXCJjbGlja1wiLGUuaHJlZix7dHJhbnNwb3J0OlwiYmVhY29uXCJ9KSl9LG4ucHJvdG90eXBlLnNob3VsZFRyYWNrT3V0Ym91bmRMaW5rPWZ1bmN0aW9uKHQpe3JldHVybiB0Lmhvc3RuYW1lIT1sb2NhdGlvbi5ob3N0bmFtZSYmMD09PXQucHJvdG9jb2wuaW5kZXhPZihcImh0dHBcIil9LG4ucHJvdG90eXBlLnJlbW92ZT1mdW5jdGlvbigpe3RoaXMuZGVsZWdhdGUuZGVzdHJveSgpLHRoaXMuZGVsZWdhdGU9bnVsbCx0aGlzLnRyYWNrZXI9bnVsbCx0aGlzLm9wdHM9bnVsbH0sbyhcIm91dGJvdW5kTGlua1RyYWNrZXJcIixuKX0se1wiLi4vcHJvdmlkZVwiOjgsXCIuLi91dGlsaXRpZXNcIjo5LGRlbGVnYXRlOjEzfV0sNjpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCxlKXtpZih3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcil7dGhpcy5vcHRzPXIoZSx7YXR0cmlidXRlUHJlZml4OlwiZGF0YS1cIn0pLHRoaXMudHJhY2tlcj10O3ZhciBpPXRoaXMub3B0cy5hdHRyaWJ1dGVQcmVmaXgsbj1cIltcIitpK1wic29jaWFsLW5ldHdvcmtdW1wiK2krXCJzb2NpYWwtYWN0aW9uXVtcIitpK1wic29jaWFsLXRhcmdldF1cIjt0aGlzLmhhbmRsZVNvY2lhbENsaWNrcz10aGlzLmhhbmRsZVNvY2lhbENsaWNrcy5iaW5kKHRoaXMpLHRoaXMuYWRkV2lkZ2V0TGlzdGVuZXJzPXRoaXMuYWRkV2lkZ2V0TGlzdGVuZXJzLmJpbmQodGhpcyksdGhpcy5hZGRUd2l0dGVyRXZlbnRIYW5kbGVycz10aGlzLmFkZFR3aXR0ZXJFdmVudEhhbmRsZXJzLmJpbmQodGhpcyksdGhpcy5oYW5kbGVUd2VldEV2ZW50cz10aGlzLmhhbmRsZVR3ZWV0RXZlbnRzLmJpbmQodGhpcyksdGhpcy5oYW5kbGVGb2xsb3dFdmVudHM9dGhpcy5oYW5kbGVGb2xsb3dFdmVudHMuYmluZCh0aGlzKSx0aGlzLmhhbmRsZUxpa2VFdmVudHM9dGhpcy5oYW5kbGVMaWtlRXZlbnRzLmJpbmQodGhpcyksdGhpcy5oYW5kbGVVbmxpa2VFdmVudHM9dGhpcy5oYW5kbGVVbmxpa2VFdmVudHMuYmluZCh0aGlzKSx0aGlzLmRlbGVnYXRlPWEoZG9jdW1lbnQsbixcImNsaWNrXCIsdGhpcy5oYW5kbGVTb2NpYWxDbGlja3MpLFwiY29tcGxldGVcIiE9ZG9jdW1lbnQucmVhZHlTdGF0ZT93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzLmFkZFdpZGdldExpc3RlbmVycyk6dGhpcy5hZGRXaWRnZXRMaXN0ZW5lcnMoKX19dmFyIHI9dChcIi4uL3V0aWxpdGllc1wiKS5kZWZhdWx0cyxhPXQoXCJkZWxlZ2F0ZVwiKSxvPXQoXCIuLi9wcm92aWRlXCIpO24ucHJvdG90eXBlLmFkZFdpZGdldExpc3RlbmVycz1mdW5jdGlvbigpe3dpbmRvdy5GQiYmdGhpcy5hZGRGYWNlYm9va0V2ZW50SGFuZGxlcnMoKSx3aW5kb3cudHd0dHImJnRoaXMuYWRkVHdpdHRlckV2ZW50SGFuZGxlcnMoKX0sbi5wcm90b3R5cGUuaGFuZGxlU29jaWFsQ2xpY2tzPWZ1bmN0aW9uKHQpe3ZhciBlPXQuZGVsZWdhdGVUYXJnZXQsaT10aGlzLm9wdHMuYXR0cmlidXRlUHJlZml4O3RoaXMudHJhY2tlci5zZW5kKFwic29jaWFsXCIse3NvY2lhbE5ldHdvcms6ZS5nZXRBdHRyaWJ1dGUoaStcInNvY2lhbC1uZXR3b3JrXCIpLHNvY2lhbEFjdGlvbjplLmdldEF0dHJpYnV0ZShpK1wic29jaWFsLWFjdGlvblwiKSxzb2NpYWxUYXJnZXQ6ZS5nZXRBdHRyaWJ1dGUoaStcInNvY2lhbC10YXJnZXRcIil9KX0sbi5wcm90b3R5cGUuYWRkVHdpdHRlckV2ZW50SGFuZGxlcnM9ZnVuY3Rpb24oKXt0cnl7dHd0dHIucmVhZHkoZnVuY3Rpb24oKXt0d3R0ci5ldmVudHMuYmluZChcInR3ZWV0XCIsdGhpcy5oYW5kbGVUd2VldEV2ZW50cyksdHd0dHIuZXZlbnRzLmJpbmQoXCJmb2xsb3dcIix0aGlzLmhhbmRsZUZvbGxvd0V2ZW50cyl9LmJpbmQodGhpcykpfWNhdGNoKHQpe319LG4ucHJvdG90eXBlLnJlbW92ZVR3aXR0ZXJFdmVudEhhbmRsZXJzPWZ1bmN0aW9uKCl7dHJ5e3R3dHRyLnJlYWR5KGZ1bmN0aW9uKCl7dHd0dHIuZXZlbnRzLnVuYmluZChcInR3ZWV0XCIsdGhpcy5oYW5kbGVUd2VldEV2ZW50cyksdHd0dHIuZXZlbnRzLnVuYmluZChcImZvbGxvd1wiLHRoaXMuaGFuZGxlRm9sbG93RXZlbnRzKX0uYmluZCh0aGlzKSl9Y2F0Y2godCl7fX0sbi5wcm90b3R5cGUuYWRkRmFjZWJvb2tFdmVudEhhbmRsZXJzPWZ1bmN0aW9uKCl7dHJ5e0ZCLkV2ZW50LnN1YnNjcmliZShcImVkZ2UuY3JlYXRlXCIsdGhpcy5oYW5kbGVMaWtlRXZlbnRzKSxGQi5FdmVudC5zdWJzY3JpYmUoXCJlZGdlLnJlbW92ZVwiLHRoaXMuaGFuZGxlVW5saWtlRXZlbnRzKX1jYXRjaCh0KXt9fSxuLnByb3RvdHlwZS5yZW1vdmVGYWNlYm9va0V2ZW50SGFuZGxlcnM9ZnVuY3Rpb24oKXt0cnl7RkIuRXZlbnQudW5zdWJzY3JpYmUoXCJlZGdlLmNyZWF0ZVwiLHRoaXMuaGFuZGxlTGlrZUV2ZW50cyksRkIuRXZlbnQudW5zdWJzY3JpYmUoXCJlZGdlLnJlbW92ZVwiLHRoaXMuaGFuZGxlVW5saWtlRXZlbnRzKX1jYXRjaCh0KXt9fSxuLnByb3RvdHlwZS5oYW5kbGVUd2VldEV2ZW50cz1mdW5jdGlvbih0KXtpZihcInR3ZWV0XCI9PXQucmVnaW9uKXt2YXIgZT10LmRhdGEudXJsfHx0LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXVybFwiKXx8bG9jYXRpb24uaHJlZjt0aGlzLnRyYWNrZXIuc2VuZChcInNvY2lhbFwiLFwiVHdpdHRlclwiLFwidHdlZXRcIixlKX19LG4ucHJvdG90eXBlLmhhbmRsZUZvbGxvd0V2ZW50cz1mdW5jdGlvbih0KXtpZihcImZvbGxvd1wiPT10LnJlZ2lvbil7dmFyIGU9dC5kYXRhLnNjcmVlbl9uYW1lfHx0LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNjcmVlbi1uYW1lXCIpO3RoaXMudHJhY2tlci5zZW5kKFwic29jaWFsXCIsXCJUd2l0dGVyXCIsXCJmb2xsb3dcIixlKX19LG4ucHJvdG90eXBlLmhhbmRsZUxpa2VFdmVudHM9ZnVuY3Rpb24odCl7dGhpcy50cmFja2VyLnNlbmQoXCJzb2NpYWxcIixcIkZhY2Vib29rXCIsXCJsaWtlXCIsdCl9LG4ucHJvdG90eXBlLmhhbmRsZVVubGlrZUV2ZW50cz1mdW5jdGlvbih0KXt0aGlzLnRyYWNrZXIuc2VuZChcInNvY2lhbFwiLFwiRmFjZWJvb2tcIixcInVubGlrZVwiLHQpfSxuLnByb3RvdHlwZS5yZW1vdmU9ZnVuY3Rpb24oKXt3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzLmFkZFdpZGdldExpc3RlbmVycyksdGhpcy5yZW1vdmVGYWNlYm9va0V2ZW50SGFuZGxlcnMoKSx0aGlzLnJlbW92ZVR3aXR0ZXJFdmVudEhhbmRsZXJzKCksdGhpcy5kZWxlZ2F0ZS5kZXN0cm95KCksdGhpcy5kZWxlZ2F0ZT1udWxsLHRoaXMudHJhY2tlcj1udWxsLHRoaXMub3B0cz1udWxsLHRoaXMuaGFuZGxlU29jaWFsQ2xpY2tzPW51bGwsdGhpcy5hZGRXaWRnZXRMaXN0ZW5lcnM9bnVsbCx0aGlzLmFkZFR3aXR0ZXJFdmVudEhhbmRsZXJzPW51bGwsdGhpcy5oYW5kbGVUd2VldEV2ZW50cz1udWxsLHRoaXMuaGFuZGxlRm9sbG93RXZlbnRzPW51bGwsdGhpcy5oYW5kbGVMaWtlRXZlbnRzPW51bGwsdGhpcy5oYW5kbGVVbmxpa2VFdmVudHM9bnVsbH0sbyhcInNvY2lhbFRyYWNrZXJcIixuKX0se1wiLi4vcHJvdmlkZVwiOjgsXCIuLi91dGlsaXRpZXNcIjo5LGRlbGVnYXRlOjEzfV0sNzpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCxlKXtoaXN0b3J5LnB1c2hTdGF0ZSYmd2luZG93LmFkZEV2ZW50TGlzdGVuZXImJih0aGlzLm9wdHM9YShlLHtzaG91bGRUcmFja1VybENoYW5nZTp0aGlzLnNob3VsZFRyYWNrVXJsQ2hhbmdlfSksdGhpcy50cmFja2VyPXQsdGhpcy5wYXRoPXIoKSx0aGlzLnVwZGF0ZVRyYWNrZXJEYXRhPXRoaXMudXBkYXRlVHJhY2tlckRhdGEuYmluZCh0aGlzKSx0aGlzLm9yaWdpbmFsUHVzaFN0YXRlPWhpc3RvcnkucHVzaFN0YXRlLGhpc3RvcnkucHVzaFN0YXRlPWZ1bmN0aW9uKHQsZSl7byh0KSYmZSYmKHQudGl0bGU9ZSksdGhpcy5vcmlnaW5hbFB1c2hTdGF0ZS5hcHBseShoaXN0b3J5LGFyZ3VtZW50cyksdGhpcy51cGRhdGVUcmFja2VyRGF0YSgpfS5iaW5kKHRoaXMpLHRoaXMub3JpZ2luYWxSZXBsYWNlU3RhdGU9aGlzdG9yeS5yZXBsYWNlU3RhdGUsaGlzdG9yeS5yZXBsYWNlU3RhdGU9ZnVuY3Rpb24odCxlKXtvKHQpJiZlJiYodC50aXRsZT1lKSx0aGlzLm9yaWdpbmFsUmVwbGFjZVN0YXRlLmFwcGx5KGhpc3RvcnksYXJndW1lbnRzKSx0aGlzLnVwZGF0ZVRyYWNrZXJEYXRhKCExKX0uYmluZCh0aGlzKSx3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsdGhpcy51cGRhdGVUcmFja2VyRGF0YSkpfWZ1bmN0aW9uIHIoKXtyZXR1cm4gbG9jYXRpb24ucGF0aG5hbWUrbG9jYXRpb24uc2VhcmNofXZhciBhPXQoXCIuLi91dGlsaXRpZXNcIikuZGVmYXVsdHMsbz10KFwiLi4vdXRpbGl0aWVzXCIpLmlzT2JqZWN0LHM9dChcIi4uL3Byb3ZpZGVcIik7bi5wcm90b3R5cGUudXBkYXRlVHJhY2tlckRhdGE9ZnVuY3Rpb24odCl7dD10IT09ITEsc2V0VGltZW91dChmdW5jdGlvbigpe3ZhciBlPXRoaXMucGF0aCxpPXIoKTtlIT1pJiZ0aGlzLm9wdHMuc2hvdWxkVHJhY2tVcmxDaGFuZ2UuY2FsbCh0aGlzLGksZSkmJih0aGlzLnBhdGg9aSx0aGlzLnRyYWNrZXIuc2V0KHtwYWdlOmksdGl0bGU6byhoaXN0b3J5LnN0YXRlKSYmaGlzdG9yeS5zdGF0ZS50aXRsZXx8ZG9jdW1lbnQudGl0bGV9KSx0JiZ0aGlzLnRyYWNrZXIuc2VuZChcInBhZ2V2aWV3XCIpKX0uYmluZCh0aGlzKSwwKX0sbi5wcm90b3R5cGUuc2hvdWxkVHJhY2tVcmxDaGFuZ2U9ZnVuY3Rpb24odCxlKXtyZXR1cm4gdCYmZX0sbi5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKCl7d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLHRoaXMudXBkYXRlVHJhY2tlckRhdGEpLGhpc3RvcnkucmVwbGFjZVN0YXRlPXRoaXMub3JpZ2luYWxSZXBsYWNlU3RhdGUsaGlzdG9yeS5wdXNoU3RhdGU9dGhpcy5vcmlnaW5hbFB1c2hTdGF0ZSx0aGlzLnRyYWNrZXI9bnVsbCx0aGlzLm9wdHM9bnVsbCx0aGlzLnBhdGg9bnVsbCx0aGlzLnVwZGF0ZVRyYWNrZXJEYXRhPW51bGwsdGhpcy5vcmlnaW5hbFJlcGxhY2VTdGF0ZT1udWxsLHRoaXMub3JpZ2luYWxQdXNoU3RhdGU9bnVsbH0scyhcInVybENoYW5nZVRyYWNrZXJcIixuKX0se1wiLi4vcHJvdmlkZVwiOjgsXCIuLi91dGlsaXRpZXNcIjo5fV0sODpbZnVuY3Rpb24odCxlLGkpe3ZhciBuPXQoXCIuL2NvbnN0YW50c1wiKSxyPXQoXCIuL3V0aWxpdGllc1wiKTsod2luZG93LmdhRGV2SWRzPXdpbmRvdy5nYURldklkc3x8W10pLnB1c2gobi5ERVZfSUQpLGUuZXhwb3J0cz1mdW5jdGlvbih0LGUpe3ZhciBpPXdpbmRvdy5Hb29nbGVBbmFseXRpY3NPYmplY3R8fFwiZ2FcIjt3aW5kb3dbaV09d2luZG93W2ldfHxmdW5jdGlvbigpeyh3aW5kb3dbaV0ucT13aW5kb3dbaV0ucXx8W10pLnB1c2goYXJndW1lbnRzKX0sd2luZG93W2ldKFwicHJvdmlkZVwiLHQsZSksd2luZG93LmdhcGx1Z2lucz13aW5kb3cuZ2FwbHVnaW5zfHx7fSx3aW5kb3cuZ2FwbHVnaW5zW3IuY2FwaXRhbGl6ZSh0KV09ZX19LHtcIi4vY29uc3RhbnRzXCI6MSxcIi4vdXRpbGl0aWVzXCI6OX1dLDk6W2Z1bmN0aW9uKHQsZSxpKXt2YXIgbj17d2l0aFRpbWVvdXQ6ZnVuY3Rpb24odCxlKXt2YXIgaT0hMTtyZXR1cm4gc2V0VGltZW91dCh0LGV8fDJlMyksZnVuY3Rpb24oKXtpfHwoaT0hMCx0KCkpfX0sZGVmYXVsdHM6ZnVuY3Rpb24odCxlKXt2YXIgaT17fTtcIm9iamVjdFwiIT10eXBlb2YgdCYmKHQ9e30pLFwib2JqZWN0XCIhPXR5cGVvZiBlJiYoZT17fSk7Zm9yKHZhciBuIGluIGUpZS5oYXNPd25Qcm9wZXJ0eShuKSYmKGlbbl09dC5oYXNPd25Qcm9wZXJ0eShuKT90W25dOmVbbl0pO3JldHVybiBpfSxjYXBpdGFsaXplOmZ1bmN0aW9uKHQpe3JldHVybiB0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpK3Quc2xpY2UoMSl9LGlzT2JqZWN0OmZ1bmN0aW9uKHQpe3JldHVyblwib2JqZWN0XCI9PXR5cGVvZiB0JiZudWxsIT09dH0saXNBcnJheTpBcnJheS5pc0FycmF5fHxmdW5jdGlvbih0KXtyZXR1cm5cIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCl9LHRvQXJyYXk6ZnVuY3Rpb24odCl7cmV0dXJuIG4uaXNBcnJheSh0KT90Olt0XX19O2UuZXhwb3J0cz1ufSx7fV0sMTA6W2Z1bmN0aW9uKHQsZSxpKXt2YXIgbj10KFwibWF0Y2hlcy1zZWxlY3RvclwiKTtlLmV4cG9ydHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgcj1pP3Q6dC5wYXJlbnROb2RlO3ImJnIhPT1kb2N1bWVudDspe2lmKG4ocixlKSlyZXR1cm4gcjtyPXIucGFyZW50Tm9kZX19fSx7XCJtYXRjaGVzLXNlbGVjdG9yXCI6MTR9XSwxMTpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4oKXtyZXR1cm4obmV3IERhdGUpLmdldFRpbWUoKX1lLmV4cG9ydHM9RGF0ZS5ub3d8fG59LHt9XSwxMjpbZnVuY3Rpb24odCxlLGkpe3ZhciBuPXQoXCJkYXRlLW5vd1wiKTtlLmV4cG9ydHM9ZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIHIoKXt2YXIgZD1uKCktbDtlPmQmJmQ+MD9hPXNldFRpbWVvdXQocixlLWQpOihhPW51bGwsaXx8KHU9dC5hcHBseShzLG8pLGF8fChzPW89bnVsbCkpKX12YXIgYSxvLHMsbCx1O3JldHVybiBudWxsPT1lJiYoZT0xMDApLGZ1bmN0aW9uKCl7cz10aGlzLG89YXJndW1lbnRzLGw9bigpO3ZhciBkPWkmJiFhO3JldHVybiBhfHwoYT1zZXRUaW1lb3V0KHIsZSkpLGQmJih1PXQuYXBwbHkocyxvKSxzPW89bnVsbCksdX19fSx7XCJkYXRlLW5vd1wiOjExfV0sMTM6W2Z1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQsZSxpLG4sYSl7dmFyIG89ci5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIHQuYWRkRXZlbnRMaXN0ZW5lcihpLG8sYSkse2Rlc3Ryb3k6ZnVuY3Rpb24oKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoaSxvLGEpfX19ZnVuY3Rpb24gcih0LGUsaSxuKXtyZXR1cm4gZnVuY3Rpb24oaSl7aS5kZWxlZ2F0ZVRhcmdldD1hKGkudGFyZ2V0LGUsITApLGkuZGVsZWdhdGVUYXJnZXQmJm4uY2FsbCh0LGkpfX12YXIgYT10KFwiY2xvc2VzdFwiKTtlLmV4cG9ydHM9bn0se2Nsb3Nlc3Q6MTB9XSwxNDpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCxlKXtpZihhKXJldHVybiBhLmNhbGwodCxlKTtmb3IodmFyIGk9dC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoZSksbj0wO248aS5sZW5ndGg7KytuKWlmKGlbbl09PXQpcmV0dXJuITA7cmV0dXJuITF9dmFyIHI9RWxlbWVudC5wcm90b3R5cGUsYT1yLm1hdGNoZXNTZWxlY3Rvcnx8ci53ZWJraXRNYXRjaGVzU2VsZWN0b3J8fHIubW96TWF0Y2hlc1NlbGVjdG9yfHxyLm1zTWF0Y2hlc1NlbGVjdG9yfHxyLm9NYXRjaGVzU2VsZWN0b3I7ZS5leHBvcnRzPW59LHt9XSwxNTpbZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCxlKXt2YXIgaT13aW5kb3dbd2luZG93Lkdvb2dsZUFuYWx5dGljc09iamVjdHx8XCJnYVwiXSxuPXQuZ2V0KFwibmFtZVwiKTtpKG4rXCIucmVxdWlyZVwiLFwiZXZlbnRUcmFja2VyXCIsZSksaShuK1wiLnJlcXVpcmVcIixcIm1lZGlhUXVlcnlUcmFja2VyXCIsZSksaShuK1wiLnJlcXVpcmVcIixcIm91dGJvdW5kRm9ybVRyYWNrZXJcIixlKSxpKG4rXCIucmVxdWlyZVwiLFwib3V0Ym91bmRMaW5rVHJhY2tlclwiLGUpLGkobitcIi5yZXF1aXJlXCIsXCJzb2NpYWxUcmFja2VyXCIsZSksaShuK1wiLnJlcXVpcmVcIixcInVybENoYW5nZVRyYWNrZXJcIixlKX10KFwiLi9ldmVudC10cmFja2VyXCIpLHQoXCIuL21lZGlhLXF1ZXJ5LXRyYWNrZXJcIiksdChcIi4vb3V0Ym91bmQtZm9ybS10cmFja2VyXCIpLHQoXCIuL291dGJvdW5kLWxpbmstdHJhY2tlclwiKSx0KFwiLi9zb2NpYWwtdHJhY2tlclwiKSx0KFwiLi91cmwtY2hhbmdlLXRyYWNrZXJcIik7dmFyIHI9dChcIi4uL3Byb3ZpZGVcIik7cihcImF1dG90cmFja1wiLG4pfSx7XCIuLi9wcm92aWRlXCI6OCxcIi4vZXZlbnQtdHJhY2tlclwiOjIsXCIuL21lZGlhLXF1ZXJ5LXRyYWNrZXJcIjozLFwiLi9vdXRib3VuZC1mb3JtLXRyYWNrZXJcIjo0LFwiLi9vdXRib3VuZC1saW5rLXRyYWNrZXJcIjo1LFwiLi9zb2NpYWwtdHJhY2tlclwiOjYsXCIuL3VybC1jaGFuZ2UtdHJhY2tlclwiOjd9XX0se30sWzE1XSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1hdXRvdHJhY2suanMubWFwXG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMTYgU21hbGwgQmF0Y2gsIEluYy5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdFxuICogdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2ZcbiAqIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUXG4gKiBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGVcbiAqIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyXG4gKiB0aGUgTGljZW5zZS5cbiAqL1xuLyogV2ViIEZvbnQgTG9hZGVyIHYxLjYuMjYgLSAoYykgQWRvYmUgU3lzdGVtcywgR29vZ2xlLiBMaWNlbnNlOiBBcGFjaGUgMi4wICovKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gYWEoYSxiLGMpe3JldHVybiBhLmNhbGwuYXBwbHkoYS5iaW5kLGFyZ3VtZW50cyl9ZnVuY3Rpb24gYmEoYSxiLGMpe2lmKCFhKXRocm93IEVycm9yKCk7aWYoMjxhcmd1bWVudHMubGVuZ3RoKXt2YXIgZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMik7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjLGQpO3JldHVybiBhLmFwcGx5KGIsYyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsYXJndW1lbnRzKX19ZnVuY3Rpb24gcChhLGIsYyl7cD1GdW5jdGlvbi5wcm90b3R5cGUuYmluZCYmLTEhPUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLnRvU3RyaW5nKCkuaW5kZXhPZihcIm5hdGl2ZSBjb2RlXCIpP2FhOmJhO3JldHVybiBwLmFwcGx5KG51bGwsYXJndW1lbnRzKX12YXIgcT1EYXRlLm5vd3x8ZnVuY3Rpb24oKXtyZXR1cm4rbmV3IERhdGV9O2Z1bmN0aW9uIGNhKGEsYil7dGhpcy5hPWE7dGhpcy5tPWJ8fGE7dGhpcy5jPXRoaXMubS5kb2N1bWVudH12YXIgZGE9ISF3aW5kb3cuRm9udEZhY2U7ZnVuY3Rpb24gdChhLGIsYyxkKXtiPWEuYy5jcmVhdGVFbGVtZW50KGIpO2lmKGMpZm9yKHZhciBlIGluIGMpYy5oYXNPd25Qcm9wZXJ0eShlKSYmKFwic3R5bGVcIj09ZT9iLnN0eWxlLmNzc1RleHQ9Y1tlXTpiLnNldEF0dHJpYnV0ZShlLGNbZV0pKTtkJiZiLmFwcGVuZENoaWxkKGEuYy5jcmVhdGVUZXh0Tm9kZShkKSk7cmV0dXJuIGJ9ZnVuY3Rpb24gdShhLGIsYyl7YT1hLmMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYilbMF07YXx8KGE9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTthLmluc2VydEJlZm9yZShjLGEubGFzdENoaWxkKX1mdW5jdGlvbiB2KGEpe2EucGFyZW50Tm9kZSYmYS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGEpfVxuZnVuY3Rpb24gdyhhLGIsYyl7Yj1ifHxbXTtjPWN8fFtdO2Zvcih2YXIgZD1hLmNsYXNzTmFtZS5zcGxpdCgvXFxzKy8pLGU9MDtlPGIubGVuZ3RoO2UrPTEpe2Zvcih2YXIgZj0hMSxnPTA7ZzxkLmxlbmd0aDtnKz0xKWlmKGJbZV09PT1kW2ddKXtmPSEwO2JyZWFrfWZ8fGQucHVzaChiW2VdKX1iPVtdO2ZvcihlPTA7ZTxkLmxlbmd0aDtlKz0xKXtmPSExO2ZvcihnPTA7ZzxjLmxlbmd0aDtnKz0xKWlmKGRbZV09PT1jW2ddKXtmPSEwO2JyZWFrfWZ8fGIucHVzaChkW2VdKX1hLmNsYXNzTmFtZT1iLmpvaW4oXCIgXCIpLnJlcGxhY2UoL1xccysvZyxcIiBcIikucmVwbGFjZSgvXlxccyt8XFxzKyQvLFwiXCIpfWZ1bmN0aW9uIHkoYSxiKXtmb3IodmFyIGM9YS5jbGFzc05hbWUuc3BsaXQoL1xccysvKSxkPTAsZT1jLmxlbmd0aDtkPGU7ZCsrKWlmKGNbZF09PWIpcmV0dXJuITA7cmV0dXJuITF9XG5mdW5jdGlvbiB6KGEpe2lmKFwic3RyaW5nXCI9PT10eXBlb2YgYS5mKXJldHVybiBhLmY7dmFyIGI9YS5tLmxvY2F0aW9uLnByb3RvY29sO1wiYWJvdXQ6XCI9PWImJihiPWEuYS5sb2NhdGlvbi5wcm90b2NvbCk7cmV0dXJuXCJodHRwczpcIj09Yj9cImh0dHBzOlwiOlwiaHR0cDpcIn1mdW5jdGlvbiBlYShhKXtyZXR1cm4gYS5tLmxvY2F0aW9uLmhvc3RuYW1lfHxhLmEubG9jYXRpb24uaG9zdG5hbWV9XG5mdW5jdGlvbiBBKGEsYixjKXtmdW5jdGlvbiBkKCl7ayYmZSYmZiYmKGsoZyksaz1udWxsKX1iPXQoYSxcImxpbmtcIix7cmVsOlwic3R5bGVzaGVldFwiLGhyZWY6YixtZWRpYTpcImFsbFwifSk7dmFyIGU9ITEsZj0hMCxnPW51bGwsaz1jfHxudWxsO2RhPyhiLm9ubG9hZD1mdW5jdGlvbigpe2U9ITA7ZCgpfSxiLm9uZXJyb3I9ZnVuY3Rpb24oKXtlPSEwO2c9RXJyb3IoXCJTdHlsZXNoZWV0IGZhaWxlZCB0byBsb2FkXCIpO2QoKX0pOnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlPSEwO2QoKX0sMCk7dShhLFwiaGVhZFwiLGIpfVxuZnVuY3Rpb24gQihhLGIsYyxkKXt2YXIgZT1hLmMuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO2lmKGUpe3ZhciBmPXQoYSxcInNjcmlwdFwiLHtzcmM6Yn0pLGc9ITE7Zi5vbmxvYWQ9Zi5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtnfHx0aGlzLnJlYWR5U3RhdGUmJlwibG9hZGVkXCIhPXRoaXMucmVhZHlTdGF0ZSYmXCJjb21wbGV0ZVwiIT10aGlzLnJlYWR5U3RhdGV8fChnPSEwLGMmJmMobnVsbCksZi5vbmxvYWQ9Zi5vbnJlYWR5c3RhdGVjaGFuZ2U9bnVsbCxcIkhFQURcIj09Zi5wYXJlbnROb2RlLnRhZ05hbWUmJmUucmVtb3ZlQ2hpbGQoZikpfTtlLmFwcGVuZENoaWxkKGYpO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtnfHwoZz0hMCxjJiZjKEVycm9yKFwiU2NyaXB0IGxvYWQgdGltZW91dFwiKSkpfSxkfHw1RTMpO3JldHVybiBmfXJldHVybiBudWxsfTtmdW5jdGlvbiBDKCl7dGhpcy5hPTA7dGhpcy5jPW51bGx9ZnVuY3Rpb24gRChhKXthLmErKztyZXR1cm4gZnVuY3Rpb24oKXthLmEtLTtFKGEpfX1mdW5jdGlvbiBGKGEsYil7YS5jPWI7RShhKX1mdW5jdGlvbiBFKGEpezA9PWEuYSYmYS5jJiYoYS5jKCksYS5jPW51bGwpfTtmdW5jdGlvbiBHKGEpe3RoaXMuYT1hfHxcIi1cIn1HLnByb3RvdHlwZS5jPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1bXSxjPTA7Yzxhcmd1bWVudHMubGVuZ3RoO2MrKyliLnB1c2goYXJndW1lbnRzW2NdLnJlcGxhY2UoL1tcXFdfXSsvZyxcIlwiKS50b0xvd2VyQ2FzZSgpKTtyZXR1cm4gYi5qb2luKHRoaXMuYSl9O2Z1bmN0aW9uIEgoYSxiKXt0aGlzLmM9YTt0aGlzLmY9NDt0aGlzLmE9XCJuXCI7dmFyIGM9KGJ8fFwibjRcIikubWF0Y2goL14oW25pb10pKFsxLTldKSQvaSk7YyYmKHRoaXMuYT1jWzFdLHRoaXMuZj1wYXJzZUludChjWzJdLDEwKSl9ZnVuY3Rpb24gZmEoYSl7cmV0dXJuIEkoYSkrXCIgXCIrKGEuZitcIjAwXCIpK1wiIDMwMHB4IFwiK0ooYS5jKX1mdW5jdGlvbiBKKGEpe3ZhciBiPVtdO2E9YS5zcGxpdCgvLFxccyovKTtmb3IodmFyIGM9MDtjPGEubGVuZ3RoO2MrKyl7dmFyIGQ9YVtjXS5yZXBsYWNlKC9bJ1wiXS9nLFwiXCIpOy0xIT1kLmluZGV4T2YoXCIgXCIpfHwvXlxcZC8udGVzdChkKT9iLnB1c2goXCInXCIrZCtcIidcIik6Yi5wdXNoKGQpfXJldHVybiBiLmpvaW4oXCIsXCIpfWZ1bmN0aW9uIEsoYSl7cmV0dXJuIGEuYSthLmZ9ZnVuY3Rpb24gSShhKXt2YXIgYj1cIm5vcm1hbFwiO1wib1wiPT09YS5hP2I9XCJvYmxpcXVlXCI6XCJpXCI9PT1hLmEmJihiPVwiaXRhbGljXCIpO3JldHVybiBifVxuZnVuY3Rpb24gZ2EoYSl7dmFyIGI9NCxjPVwiblwiLGQ9bnVsbDthJiYoKGQ9YS5tYXRjaCgvKG5vcm1hbHxvYmxpcXVlfGl0YWxpYykvaSkpJiZkWzFdJiYoYz1kWzFdLnN1YnN0cigwLDEpLnRvTG93ZXJDYXNlKCkpLChkPWEubWF0Y2goLyhbMS05XTAwfG5vcm1hbHxib2xkKS9pKSkmJmRbMV0mJigvYm9sZC9pLnRlc3QoZFsxXSk/Yj03Oi9bMS05XTAwLy50ZXN0KGRbMV0pJiYoYj1wYXJzZUludChkWzFdLnN1YnN0cigwLDEpLDEwKSkpKTtyZXR1cm4gYytifTtmdW5jdGlvbiBoYShhLGIpe3RoaXMuYz1hO3RoaXMuZj1hLm0uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O3RoaXMuaD1iO3RoaXMuYT1uZXcgRyhcIi1cIik7dGhpcy5qPSExIT09Yi5ldmVudHM7dGhpcy5nPSExIT09Yi5jbGFzc2VzfWZ1bmN0aW9uIGlhKGEpe2EuZyYmdyhhLmYsW2EuYS5jKFwid2ZcIixcImxvYWRpbmdcIildKTtMKGEsXCJsb2FkaW5nXCIpfWZ1bmN0aW9uIE0oYSl7aWYoYS5nKXt2YXIgYj15KGEuZixhLmEuYyhcIndmXCIsXCJhY3RpdmVcIikpLGM9W10sZD1bYS5hLmMoXCJ3ZlwiLFwibG9hZGluZ1wiKV07Ynx8Yy5wdXNoKGEuYS5jKFwid2ZcIixcImluYWN0aXZlXCIpKTt3KGEuZixjLGQpfUwoYSxcImluYWN0aXZlXCIpfWZ1bmN0aW9uIEwoYSxiLGMpe2lmKGEuaiYmYS5oW2JdKWlmKGMpYS5oW2JdKGMuYyxLKGMpKTtlbHNlIGEuaFtiXSgpfTtmdW5jdGlvbiBqYSgpe3RoaXMuYz17fX1mdW5jdGlvbiBrYShhLGIsYyl7dmFyIGQ9W10sZTtmb3IoZSBpbiBiKWlmKGIuaGFzT3duUHJvcGVydHkoZSkpe3ZhciBmPWEuY1tlXTtmJiZkLnB1c2goZihiW2VdLGMpKX1yZXR1cm4gZH07ZnVuY3Rpb24gTihhLGIpe3RoaXMuYz1hO3RoaXMuZj1iO3RoaXMuYT10KHRoaXMuYyxcInNwYW5cIix7XCJhcmlhLWhpZGRlblwiOlwidHJ1ZVwifSx0aGlzLmYpfWZ1bmN0aW9uIE8oYSl7dShhLmMsXCJib2R5XCIsYS5hKX1mdW5jdGlvbiBQKGEpe3JldHVyblwiZGlzcGxheTpibG9jaztwb3NpdGlvbjphYnNvbHV0ZTt0b3A6LTk5OTlweDtsZWZ0Oi05OTk5cHg7Zm9udC1zaXplOjMwMHB4O3dpZHRoOmF1dG87aGVpZ2h0OmF1dG87bGluZS1oZWlnaHQ6bm9ybWFsO21hcmdpbjowO3BhZGRpbmc6MDtmb250LXZhcmlhbnQ6bm9ybWFsO3doaXRlLXNwYWNlOm5vd3JhcDtmb250LWZhbWlseTpcIitKKGEuYykrXCI7XCIrKFwiZm9udC1zdHlsZTpcIitJKGEpK1wiO2ZvbnQtd2VpZ2h0OlwiKyhhLmYrXCIwMFwiKStcIjtcIil9O2Z1bmN0aW9uIFEoYSxiLGMsZCxlLGYpe3RoaXMuZz1hO3RoaXMuaj1iO3RoaXMuYT1kO3RoaXMuYz1jO3RoaXMuZj1lfHwzRTM7dGhpcy5oPWZ8fHZvaWQgMH1RLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuYy5tLmRvY3VtZW50LGI9dGhpcyxjPXEoKSxkPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGQsZSl7ZnVuY3Rpb24gaygpe3EoKS1jPj1iLmY/ZSgpOmEuZm9udHMubG9hZChmYShiLmEpLGIuaCkudGhlbihmdW5jdGlvbihhKXsxPD1hLmxlbmd0aD9kKCk6c2V0VGltZW91dChrLDI1KX0sZnVuY3Rpb24oKXtlKCl9KX1rKCl9KSxlPW5ldyBQcm9taXNlKGZ1bmN0aW9uKGEsZCl7c2V0VGltZW91dChkLGIuZil9KTtQcm9taXNlLnJhY2UoW2UsZF0pLnRoZW4oZnVuY3Rpb24oKXtiLmcoYi5hKX0sZnVuY3Rpb24oKXtiLmooYi5hKX0pfTtmdW5jdGlvbiBSKGEsYixjLGQsZSxmLGcpe3RoaXMudj1hO3RoaXMuQj1iO3RoaXMuYz1jO3RoaXMuYT1kO3RoaXMucz1nfHxcIkJFU2Jzd3lcIjt0aGlzLmY9e307dGhpcy53PWV8fDNFMzt0aGlzLnU9Znx8bnVsbDt0aGlzLm89dGhpcy5qPXRoaXMuaD10aGlzLmc9bnVsbDt0aGlzLmc9bmV3IE4odGhpcy5jLHRoaXMucyk7dGhpcy5oPW5ldyBOKHRoaXMuYyx0aGlzLnMpO3RoaXMuaj1uZXcgTih0aGlzLmMsdGhpcy5zKTt0aGlzLm89bmV3IE4odGhpcy5jLHRoaXMucyk7YT1uZXcgSCh0aGlzLmEuYytcIixzZXJpZlwiLEsodGhpcy5hKSk7YT1QKGEpO3RoaXMuZy5hLnN0eWxlLmNzc1RleHQ9YTthPW5ldyBIKHRoaXMuYS5jK1wiLHNhbnMtc2VyaWZcIixLKHRoaXMuYSkpO2E9UChhKTt0aGlzLmguYS5zdHlsZS5jc3NUZXh0PWE7YT1uZXcgSChcInNlcmlmXCIsSyh0aGlzLmEpKTthPVAoYSk7dGhpcy5qLmEuc3R5bGUuY3NzVGV4dD1hO2E9bmV3IEgoXCJzYW5zLXNlcmlmXCIsSyh0aGlzLmEpKTthPVxuUChhKTt0aGlzLm8uYS5zdHlsZS5jc3NUZXh0PWE7Tyh0aGlzLmcpO08odGhpcy5oKTtPKHRoaXMuaik7Tyh0aGlzLm8pfXZhciBTPXtEOlwic2VyaWZcIixDOlwic2Fucy1zZXJpZlwifSxUPW51bGw7ZnVuY3Rpb24gVSgpe2lmKG51bGw9PT1UKXt2YXIgYT0vQXBwbGVXZWJLaXRcXC8oWzAtOV0rKSg/OlxcLihbMC05XSspKS8uZXhlYyh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCk7VD0hIWEmJig1MzY+cGFyc2VJbnQoYVsxXSwxMCl8fDUzNj09PXBhcnNlSW50KGFbMV0sMTApJiYxMT49cGFyc2VJbnQoYVsyXSwxMCkpfXJldHVybiBUfVIucHJvdG90eXBlLnN0YXJ0PWZ1bmN0aW9uKCl7dGhpcy5mLnNlcmlmPXRoaXMuai5hLm9mZnNldFdpZHRoO3RoaXMuZltcInNhbnMtc2VyaWZcIl09dGhpcy5vLmEub2Zmc2V0V2lkdGg7dGhpcy5BPXEoKTtsYSh0aGlzKX07XG5mdW5jdGlvbiBtYShhLGIsYyl7Zm9yKHZhciBkIGluIFMpaWYoUy5oYXNPd25Qcm9wZXJ0eShkKSYmYj09PWEuZltTW2RdXSYmYz09PWEuZltTW2RdXSlyZXR1cm4hMDtyZXR1cm4hMX1mdW5jdGlvbiBsYShhKXt2YXIgYj1hLmcuYS5vZmZzZXRXaWR0aCxjPWEuaC5hLm9mZnNldFdpZHRoLGQ7KGQ9Yj09PWEuZi5zZXJpZiYmYz09PWEuZltcInNhbnMtc2VyaWZcIl0pfHwoZD1VKCkmJm1hKGEsYixjKSk7ZD9xKCktYS5BPj1hLnc/VSgpJiZtYShhLGIsYykmJihudWxsPT09YS51fHxhLnUuaGFzT3duUHJvcGVydHkoYS5hLmMpKT9WKGEsYS52KTpWKGEsYS5CKTpuYShhKTpWKGEsYS52KX1mdW5jdGlvbiBuYShhKXtzZXRUaW1lb3V0KHAoZnVuY3Rpb24oKXtsYSh0aGlzKX0sYSksNTApfWZ1bmN0aW9uIFYoYSxiKXtzZXRUaW1lb3V0KHAoZnVuY3Rpb24oKXt2KHRoaXMuZy5hKTt2KHRoaXMuaC5hKTt2KHRoaXMuai5hKTt2KHRoaXMuby5hKTtiKHRoaXMuYSl9LGEpLDApfTtmdW5jdGlvbiBXKGEsYixjKXt0aGlzLmM9YTt0aGlzLmE9Yjt0aGlzLmY9MDt0aGlzLm89dGhpcy5qPSExO3RoaXMucz1jfXZhciBYPW51bGw7Vy5wcm90b3R5cGUuZz1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmE7Yi5nJiZ3KGIuZixbYi5hLmMoXCJ3ZlwiLGEuYyxLKGEpLnRvU3RyaW5nKCksXCJhY3RpdmVcIildLFtiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImxvYWRpbmdcIiksYi5hLmMoXCJ3ZlwiLGEuYyxLKGEpLnRvU3RyaW5nKCksXCJpbmFjdGl2ZVwiKV0pO0woYixcImZvbnRhY3RpdmVcIixhKTt0aGlzLm89ITA7b2EodGhpcyl9O1xuVy5wcm90b3R5cGUuaD1mdW5jdGlvbihhKXt2YXIgYj10aGlzLmE7aWYoYi5nKXt2YXIgYz15KGIuZixiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImFjdGl2ZVwiKSksZD1bXSxlPVtiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImxvYWRpbmdcIildO2N8fGQucHVzaChiLmEuYyhcIndmXCIsYS5jLEsoYSkudG9TdHJpbmcoKSxcImluYWN0aXZlXCIpKTt3KGIuZixkLGUpfUwoYixcImZvbnRpbmFjdGl2ZVwiLGEpO29hKHRoaXMpfTtmdW5jdGlvbiBvYShhKXswPT0tLWEuZiYmYS5qJiYoYS5vPyhhPWEuYSxhLmcmJncoYS5mLFthLmEuYyhcIndmXCIsXCJhY3RpdmVcIildLFthLmEuYyhcIndmXCIsXCJsb2FkaW5nXCIpLGEuYS5jKFwid2ZcIixcImluYWN0aXZlXCIpXSksTChhLFwiYWN0aXZlXCIpKTpNKGEuYSkpfTtmdW5jdGlvbiBwYShhKXt0aGlzLmo9YTt0aGlzLmE9bmV3IGphO3RoaXMuaD0wO3RoaXMuZj10aGlzLmc9ITB9cGEucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oYSl7dGhpcy5jPW5ldyBjYSh0aGlzLmosYS5jb250ZXh0fHx0aGlzLmopO3RoaXMuZz0hMSE9PWEuZXZlbnRzO3RoaXMuZj0hMSE9PWEuY2xhc3NlcztxYSh0aGlzLG5ldyBoYSh0aGlzLmMsYSksYSl9O1xuZnVuY3Rpb24gcmEoYSxiLGMsZCxlKXt2YXIgZj0wPT0tLWEuaDsoYS5mfHxhLmcpJiZzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIGE9ZXx8bnVsbCxrPWR8fG51bGx8fHt9O2lmKDA9PT1jLmxlbmd0aCYmZilNKGIuYSk7ZWxzZXtiLmYrPWMubGVuZ3RoO2YmJihiLmo9Zik7dmFyIGgsbT1bXTtmb3IoaD0wO2g8Yy5sZW5ndGg7aCsrKXt2YXIgbD1jW2hdLG49a1tsLmNdLHI9Yi5hLHg9bDtyLmcmJncoci5mLFtyLmEuYyhcIndmXCIseC5jLEsoeCkudG9TdHJpbmcoKSxcImxvYWRpbmdcIildKTtMKHIsXCJmb250bG9hZGluZ1wiLHgpO3I9bnVsbDtudWxsPT09WCYmKFg9d2luZG93LkZvbnRGYWNlPyh4PS9HZWNrby4qRmlyZWZveFxcLyhcXGQrKS8uZXhlYyh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudCkpPzQyPHBhcnNlSW50KHhbMV0sMTApOiEwOiExKTtYP3I9bmV3IFEocChiLmcsYikscChiLmgsYiksYi5jLGwsYi5zLG4pOnI9bmV3IFIocChiLmcsYikscChiLmgsYiksYi5jLGwsYi5zLGEsXG5uKTttLnB1c2gocil9Zm9yKGg9MDtoPG0ubGVuZ3RoO2grKyltW2hdLnN0YXJ0KCl9fSwwKX1mdW5jdGlvbiBxYShhLGIsYyl7dmFyIGQ9W10sZT1jLnRpbWVvdXQ7aWEoYik7dmFyIGQ9a2EoYS5hLGMsYS5jKSxmPW5ldyBXKGEuYyxiLGUpO2EuaD1kLmxlbmd0aDtiPTA7Zm9yKGM9ZC5sZW5ndGg7YjxjO2IrKylkW2JdLmxvYWQoZnVuY3Rpb24oYixkLGMpe3JhKGEsZixiLGQsYyl9KX07ZnVuY3Rpb24gc2EoYSxiKXt0aGlzLmM9YTt0aGlzLmE9Yn1mdW5jdGlvbiB0YShhLGIsYyl7dmFyIGQ9eihhLmMpO2E9KGEuYS5hcGl8fFwiZmFzdC5mb250cy5uZXQvanNhcGlcIikucmVwbGFjZSgvXi4qaHR0cChzPyk6KFxcL1xcLyk/LyxcIlwiKTtyZXR1cm4gZCtcIi8vXCIrYStcIi9cIitiK1wiLmpzXCIrKGM/XCI/dj1cIitjOlwiXCIpfVxuc2EucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oYSl7ZnVuY3Rpb24gYigpe2lmKGZbXCJfX210aV9mbnRMc3RcIitkXSl7dmFyIGM9ZltcIl9fbXRpX2ZudExzdFwiK2RdKCksZT1bXSxoO2lmKGMpZm9yKHZhciBtPTA7bTxjLmxlbmd0aDttKyspe3ZhciBsPWNbbV0uZm9udGZhbWlseTt2b2lkIDAhPWNbbV0uZm9udFN0eWxlJiZ2b2lkIDAhPWNbbV0uZm9udFdlaWdodD8oaD1jW21dLmZvbnRTdHlsZStjW21dLmZvbnRXZWlnaHQsZS5wdXNoKG5ldyBIKGwsaCkpKTplLnB1c2gobmV3IEgobCkpfWEoZSl9ZWxzZSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YigpfSw1MCl9dmFyIGM9dGhpcyxkPWMuYS5wcm9qZWN0SWQsZT1jLmEudmVyc2lvbjtpZihkKXt2YXIgZj1jLmMubTtCKHRoaXMuYyx0YShjLGQsZSksZnVuY3Rpb24oZSl7ZT9hKFtdKTooZltcIl9fTW9ub3R5cGVDb25maWd1cmF0aW9uX19cIitkXT1mdW5jdGlvbigpe3JldHVybiBjLmF9LGIoKSl9KS5pZD1cIl9fTW9ub3R5cGVBUElTY3JpcHRfX1wiK1xuZH1lbHNlIGEoW10pfTtmdW5jdGlvbiB1YShhLGIpe3RoaXMuYz1hO3RoaXMuYT1ifXVhLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKGEpe3ZhciBiLGMsZD10aGlzLmEudXJsc3x8W10sZT10aGlzLmEuZmFtaWxpZXN8fFtdLGY9dGhpcy5hLnRlc3RTdHJpbmdzfHx7fSxnPW5ldyBDO2I9MDtmb3IoYz1kLmxlbmd0aDtiPGM7YisrKUEodGhpcy5jLGRbYl0sRChnKSk7dmFyIGs9W107Yj0wO2ZvcihjPWUubGVuZ3RoO2I8YztiKyspaWYoZD1lW2JdLnNwbGl0KFwiOlwiKSxkWzFdKWZvcih2YXIgaD1kWzFdLnNwbGl0KFwiLFwiKSxtPTA7bTxoLmxlbmd0aDttKz0xKWsucHVzaChuZXcgSChkWzBdLGhbbV0pKTtlbHNlIGsucHVzaChuZXcgSChkWzBdKSk7RihnLGZ1bmN0aW9uKCl7YShrLGYpfSl9O2Z1bmN0aW9uIHZhKGEsYixjKXthP3RoaXMuYz1hOnRoaXMuYz1iK3dhO3RoaXMuYT1bXTt0aGlzLmY9W107dGhpcy5nPWN8fFwiXCJ9dmFyIHdhPVwiLy9mb250cy5nb29nbGVhcGlzLmNvbS9jc3NcIjtmdW5jdGlvbiB4YShhLGIpe2Zvcih2YXIgYz1iLmxlbmd0aCxkPTA7ZDxjO2QrKyl7dmFyIGU9YltkXS5zcGxpdChcIjpcIik7Mz09ZS5sZW5ndGgmJmEuZi5wdXNoKGUucG9wKCkpO3ZhciBmPVwiXCI7Mj09ZS5sZW5ndGgmJlwiXCIhPWVbMV0mJihmPVwiOlwiKTthLmEucHVzaChlLmpvaW4oZikpfX1cbmZ1bmN0aW9uIHlhKGEpe2lmKDA9PWEuYS5sZW5ndGgpdGhyb3cgRXJyb3IoXCJObyBmb250cyB0byBsb2FkIVwiKTtpZigtMSE9YS5jLmluZGV4T2YoXCJraXQ9XCIpKXJldHVybiBhLmM7Zm9yKHZhciBiPWEuYS5sZW5ndGgsYz1bXSxkPTA7ZDxiO2QrKyljLnB1c2goYS5hW2RdLnJlcGxhY2UoLyAvZyxcIitcIikpO2I9YS5jK1wiP2ZhbWlseT1cIitjLmpvaW4oXCIlN0NcIik7MDxhLmYubGVuZ3RoJiYoYis9XCImc3Vic2V0PVwiK2EuZi5qb2luKFwiLFwiKSk7MDxhLmcubGVuZ3RoJiYoYis9XCImdGV4dD1cIitlbmNvZGVVUklDb21wb25lbnQoYS5nKSk7cmV0dXJuIGJ9O2Z1bmN0aW9uIHphKGEpe3RoaXMuZj1hO3RoaXMuYT1bXTt0aGlzLmM9e319XG52YXIgQWE9e2xhdGluOlwiQkVTYnN3eVwiLFwibGF0aW4tZXh0XCI6XCJcXHUwMGU3XFx1MDBmNlxcdTAwZmNcXHUwMTFmXFx1MDE1ZlwiLGN5cmlsbGljOlwiXFx1MDQzOVxcdTA0NGZcXHUwNDE2XCIsZ3JlZWs6XCJcXHUwM2IxXFx1MDNiMlxcdTAzYTNcIixraG1lcjpcIlxcdTE3ODBcXHUxNzgxXFx1MTc4MlwiLEhhbnVtYW46XCJcXHUxNzgwXFx1MTc4MVxcdTE3ODJcIn0sQmE9e3RoaW46XCIxXCIsZXh0cmFsaWdodDpcIjJcIixcImV4dHJhLWxpZ2h0XCI6XCIyXCIsdWx0cmFsaWdodDpcIjJcIixcInVsdHJhLWxpZ2h0XCI6XCIyXCIsbGlnaHQ6XCIzXCIscmVndWxhcjpcIjRcIixib29rOlwiNFwiLG1lZGl1bTpcIjVcIixcInNlbWktYm9sZFwiOlwiNlwiLHNlbWlib2xkOlwiNlwiLFwiZGVtaS1ib2xkXCI6XCI2XCIsZGVtaWJvbGQ6XCI2XCIsYm9sZDpcIjdcIixcImV4dHJhLWJvbGRcIjpcIjhcIixleHRyYWJvbGQ6XCI4XCIsXCJ1bHRyYS1ib2xkXCI6XCI4XCIsdWx0cmFib2xkOlwiOFwiLGJsYWNrOlwiOVwiLGhlYXZ5OlwiOVwiLGw6XCIzXCIscjpcIjRcIixiOlwiN1wifSxDYT17aTpcImlcIixpdGFsaWM6XCJpXCIsbjpcIm5cIixub3JtYWw6XCJuXCJ9LFxuRGE9L14odGhpbnwoPzooPzpleHRyYXx1bHRyYSktPyk/bGlnaHR8cmVndWxhcnxib29rfG1lZGl1bXwoPzooPzpzZW1pfGRlbWl8ZXh0cmF8dWx0cmEpLT8pP2JvbGR8YmxhY2t8aGVhdnl8bHxyfGJ8WzEtOV0wMCk/KG58aXxub3JtYWx8aXRhbGljKT8kLztcbmZ1bmN0aW9uIEVhKGEpe2Zvcih2YXIgYj1hLmYubGVuZ3RoLGM9MDtjPGI7YysrKXt2YXIgZD1hLmZbY10uc3BsaXQoXCI6XCIpLGU9ZFswXS5yZXBsYWNlKC9cXCsvZyxcIiBcIiksZj1bXCJuNFwiXTtpZigyPD1kLmxlbmd0aCl7dmFyIGc7dmFyIGs9ZFsxXTtnPVtdO2lmKGspZm9yKHZhciBrPWsuc3BsaXQoXCIsXCIpLGg9ay5sZW5ndGgsbT0wO208aDttKyspe3ZhciBsO2w9a1ttXTtpZihsLm1hdGNoKC9eW1xcdy1dKyQvKSl7dmFyIG49RGEuZXhlYyhsLnRvTG93ZXJDYXNlKCkpO2lmKG51bGw9PW4pbD1cIlwiO2Vsc2V7bD1uWzJdO2w9bnVsbD09bHx8XCJcIj09bD9cIm5cIjpDYVtsXTtuPW5bMV07aWYobnVsbD09bnx8XCJcIj09biluPVwiNFwiO2Vsc2UgdmFyIHI9QmFbbl0sbj1yP3I6aXNOYU4obik/XCI0XCI6bi5zdWJzdHIoMCwxKTtsPVtsLG5dLmpvaW4oXCJcIil9fWVsc2UgbD1cIlwiO2wmJmcucHVzaChsKX0wPGcubGVuZ3RoJiYoZj1nKTszPT1kLmxlbmd0aCYmKGQ9ZFsyXSxnPVtdLGQ9ZD9kLnNwbGl0KFwiLFwiKTpcbmcsMDxkLmxlbmd0aCYmKGQ9QWFbZFswXV0pJiYoYS5jW2VdPWQpKX1hLmNbZV18fChkPUFhW2VdKSYmKGEuY1tlXT1kKTtmb3IoZD0wO2Q8Zi5sZW5ndGg7ZCs9MSlhLmEucHVzaChuZXcgSChlLGZbZF0pKX19O2Z1bmN0aW9uIEZhKGEsYil7dGhpcy5jPWE7dGhpcy5hPWJ9dmFyIEdhPXtBcmltbzohMCxDb3VzaW5lOiEwLFRpbm9zOiEwfTtGYS5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhKXt2YXIgYj1uZXcgQyxjPXRoaXMuYyxkPW5ldyB2YSh0aGlzLmEuYXBpLHooYyksdGhpcy5hLnRleHQpLGU9dGhpcy5hLmZhbWlsaWVzO3hhKGQsZSk7dmFyIGY9bmV3IHphKGUpO0VhKGYpO0EoYyx5YShkKSxEKGIpKTtGKGIsZnVuY3Rpb24oKXthKGYuYSxmLmMsR2EpfSl9O2Z1bmN0aW9uIEhhKGEsYil7dGhpcy5jPWE7dGhpcy5hPWJ9SGEucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5hLmlkLGM9dGhpcy5jLm07Yj9CKHRoaXMuYywodGhpcy5hLmFwaXx8XCJodHRwczovL3VzZS50eXBla2l0Lm5ldFwiKStcIi9cIitiK1wiLmpzXCIsZnVuY3Rpb24oYil7aWYoYilhKFtdKTtlbHNlIGlmKGMuVHlwZWtpdCYmYy5UeXBla2l0LmNvbmZpZyYmYy5UeXBla2l0LmNvbmZpZy5mbil7Yj1jLlR5cGVraXQuY29uZmlnLmZuO2Zvcih2YXIgZT1bXSxmPTA7ZjxiLmxlbmd0aDtmKz0yKWZvcih2YXIgZz1iW2ZdLGs9YltmKzFdLGg9MDtoPGsubGVuZ3RoO2grKyllLnB1c2gobmV3IEgoZyxrW2hdKSk7dHJ5e2MuVHlwZWtpdC5sb2FkKHtldmVudHM6ITEsY2xhc3NlczohMSxhc3luYzohMH0pfWNhdGNoKG0pe31hKGUpfX0sMkUzKTphKFtdKX07ZnVuY3Rpb24gSWEoYSxiKXt0aGlzLmM9YTt0aGlzLmY9Yjt0aGlzLmE9W119SWEucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5mLmlkLGM9dGhpcy5jLm0sZD10aGlzO2I/KGMuX193ZWJmb250Zm9udGRlY2ttb2R1bGVfX3x8KGMuX193ZWJmb250Zm9udGRlY2ttb2R1bGVfXz17fSksYy5fX3dlYmZvbnRmb250ZGVja21vZHVsZV9fW2JdPWZ1bmN0aW9uKGIsYyl7Zm9yKHZhciBnPTAsaz1jLmZvbnRzLmxlbmd0aDtnPGs7KytnKXt2YXIgaD1jLmZvbnRzW2ddO2QuYS5wdXNoKG5ldyBIKGgubmFtZSxnYShcImZvbnQtd2VpZ2h0OlwiK2gud2VpZ2h0K1wiO2ZvbnQtc3R5bGU6XCIraC5zdHlsZSkpKX1hKGQuYSl9LEIodGhpcy5jLHoodGhpcy5jKSsodGhpcy5mLmFwaXx8XCIvL2YuZm9udGRlY2suY29tL3MvY3NzL2pzL1wiKStlYSh0aGlzLmMpK1wiL1wiK2IrXCIuanNcIixmdW5jdGlvbihiKXtiJiZhKFtdKX0pKTphKFtdKX07dmFyIFk9bmV3IHBhKHdpbmRvdyk7WS5hLmMuY3VzdG9tPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyB1YShiLGEpfTtZLmEuYy5mb250ZGVjaz1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgSWEoYixhKX07WS5hLmMubW9ub3R5cGU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IHNhKGIsYSl9O1kuYS5jLnR5cGVraXQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IEhhKGIsYSl9O1kuYS5jLmdvb2dsZT1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgRmEoYixhKX07dmFyIFo9e2xvYWQ6cChZLmxvYWQsWSl9O1wiZnVuY3Rpb25cIj09PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIFp9KTpcInVuZGVmaW5lZFwiIT09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9Wjood2luZG93LldlYkZvbnQ9Wix3aW5kb3cuV2ViRm9udENvbmZpZyYmWS5sb2FkKHdpbmRvdy5XZWJGb250Q29uZmlnKSk7fSgpKTsiXX0=
