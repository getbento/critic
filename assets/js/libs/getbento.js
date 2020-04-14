// ================================================================================================================
// =============== IMPORTANT NOTES ================================================================================
// ================================================================================================================
/**
 * The BentoAnalytics package tracks high-level front-end information relevant to the BentoBox plaftform as a 
 * whole – account, theme, pageviews, etc. The two most important classes in this package are...
 *     1. Service – abstracts/encapsulates the Keen IO tracking library.
 *     2. Normalizer – takes the various data formats passed from the themes, and converts them into standard 
 *        events. For example, one theme might track "Forms" and another "Form". We don't want multiple 
 *        variations of the same data making it through, so we combine them into one approved category.
 *        (See the Normalizer class documentation for more information and setup instructions)
 *
 * TODO:
 * - There are a few classes (shared instances) through this package that could be further simplified and hidden 
 *   from the "outside world" by including them as "private objects" directly inside our self-executing function 
 *   below. By doing so, we could eliminate our "shared model" and it would ensure that the objects are only 
 *   accessible from within this package.
 */

// self-executing function wraps our entire BentoAnalytics package, making it only accessible via the 
// `window.BentoAnalytics` namespace.
(function(){
    
    // ============================================================================================================
    // =============== MODEL ======================================================================================
    // ============================================================================================================
    /**
     * The Model class stores common settings and components that are accessible to the other classes in this 
     * package. Most notably, the Model class retrieves the `data-attributes` from the `<script>` tag that includes 
     * the meta data (account, theme, devMode, etc) that belong to this package. The "practical" purpose of this 
     * class is to have a single place at the top of this file where developers can quickly change settings and 
     * options...otherwise, you'd have to dig around through the individual classes for such high-level settings.
     *
     * TODO:
     * - Add error checking to see if the `data-attributes` failed to be retrieved. If so, we should either provide 
     *   defaults (ie...theme: "n/a", etc) or disable the entire package.
     * - This class could be further encapsulated/hidden/simplified if it was converted to a private object 
     *   instantiated immediately inside our self-executing function. This would also ensure that the "outside world" 
     *   cannot access this instance and make alternations.
     * 
     * @constructor
     * @access internal
     */
    var Model = function(){
        // shared Logger instance
        this.logger = null;
        // shared/common settings
        this.settings = {
            meta: {
                account: null,
                theme: null,
                devMode: false
            },
            logger: {
                name: "BentoAnalytics"
            },
            keen: {
                scriptUrl: "https://d26b395fwzu5fz.cloudfront.net/keen-tracking-1.1.3.min.js",
                projectId: null,
                writeKey: null,
                cookieName: "getbento-analytics-cookie"
            }
        };

        this._init();
    };

    Model.prototype = {

        /**
         * Startup and initialize.
         * @access private
         */
        _init: function(){
            this._captureData();
            this._createLogger();
        },

        /**
         * Captures the meta (ie...theme, account, devMode, etc) and Keen configuration data (id and key) JSON from 
         * the script tag's `data-attributes`. Please note, currently, there is no error handling if this fails. 
         * Please see the TODO list above for more information.
         * @access private
         */
        _captureData: function(){
            var scripts = document.getElementsByTagName("script");
            var node = scripts[scripts.length - 1];
            var attrs = node.getAttribute("data-bentoanalytics");
            var json = JSON.parse(attrs);
            
            // meta
            this.settings.meta.account = json.account;
            this.settings.meta.theme = json.theme;
            this.settings.meta.devMode = json.devMode;

            // keen
            this.settings.keen.projectId = json.id;
            this.settings.keen.writeKey = json.key;
        },

        /**
         * Creates the shared Logger instance.
         * @access private
         */
        _createLogger: function(){
            this.logger = new Logger(this.settings.logger.name, this.settings.meta.devMode);
        },

        /**
         * Returns whether we can properly instantiate and run our package. If any of the configuration data is 
         * missing, its impossible to configure the Service properly.
         * @access private
         * @returns {Boolean} - True if all data necessary to create Service exists. False if not.
         */
        _getAvailable: function(){
            // shortcuts
            var meta = this.settings.meta;
            var keen = this.settings.keen;
            // Only avaiable if everything is set...
            return (meta.account && meta.theme && keen.projectId && keen.writeKey) ? true : false;
        },
    };

    // ============================================================================================================
    // =============== BENTO ANALYTICS : API ======================================================================
    // ============================================================================================================
    /**
     * The BentoAnalytics class is the primary class (instance) that will be exposed to the `window` and "outside 
     * world". Please note, this class is mainly responsible for handling the startup process, and acting as a 
     * proxy API that abstracts the service implementation.
     * 
     * @constructor
     * @access public
     */
    var BentoAnalytics = function(){
        this.model = new Model();
        this._logger = this.model.logger;
        this.service = null;
        // Will be set to true when the Service is fully ready to receive tracking requests.
        this._ready = false;
        // If any API requests are made prior to the Service being ready, we are going to add them to our queue – 
        // which will be immediately sent in order once the Service is ready. This ensures that nothing is lost – 
        // for example, in the case where the Keen IO library is slow to load.
        this._queue = [];

        this._init();
    };

    BentoAnalytics.prototype = {

        /**
         * Startup and initialize. Please note, we're waiting until all of our other components have been created 
         * and initialized before calling `this.service.start()`. If any of the necessary configuration data is 
         * missing, we aren't even going to try to load the our Service.
         * @access private
         */
        _init: function(){
            if (this.model._getAvailable()){
                this._logger.console.info(this._logger.name + ": Initializing.");
                this._createService();
                this.service.start();
            }
            else {
                this._logger.console.warn(this._logger.name + ": Disabled. Configuration unavailable or incomplete.");
            }
        },

        /**
         * Creates the Service instance. Please note, the second parameter in the `Service()` constructor is a 
         * callback that will get fired when the service is ready to start receiving and tracking events.
         * @access private
         */
        _createService: function(){
            if (!this.service) {
                var self = this;
                this.service = new Service(this.model, function(){ self._startup(); });
            }
        },

        /**
         * Callback that fires once (and only once) the Service is fully ready to start receiving and tracking events.
         * @access private
         */
        _startup: function(){
            if (!this._ready){
                // Mark the API as ready to start using the Service.
                this._ready = true;
                this._logger.console.info(this._logger.name + ": API Ready.");
                // By default, we're always going to track the initial pageview.
                this.trackPageview();
                // If any API calls/requests were made before the Service was ready, they were added to our queue. And 
                // now we need to track them all (if any) by flusing the queue.
                this._logger.console.info(this._logger.name + ": Flushing Queue Started.", this._queue.length + " items to flush.");
                this._flushQueue();
                this._logger.console.info(this._logger.name + ": Flushing Queue Complete.");
            }
        },

        /**
         * Submits all the queued API requests that were made prior to the Service being ready. Please note, this method 
         * is called recursively, and you should be careful when modifying its implementation.
         * @access private
         */
        _flushQueue: function(){
            // If the queue is exists and has at least one item...
            if (this._queue && (this._queue.length > 0)){
                // Get the first item in the queue (which also updates the length of the remaining queue)
                var item = this._queue.shift();
                // Depending on the "type", call the relevant method with the captured "arguments".
                switch (item.type){
                    case "pageview":
                        this.trackPageview.apply(this, item.args);
                        break;

                    case "event":
                        this.trackEvent.apply(this, item.args);
                        break;
                }
                // recursively call our method until the queue is empty or no longer exists. 
                this._flushQueue();
            }
            // Once the queue is empty, we want to kill it entirely – ensuring that the recursive call is stopped immediately.
            else {
                this._queue = null;
            }
        },

        /**
         * Tracks the equivalent of a Google Analytics Event. If the Service is ready, we track it immediately. If it
         * is not yet ready, then we are adding the request to our queue. Events added to the queue will be called 
         * immediately (and in order) as soon as the Service is ready.
         * @access public
         * @param {String} category     - The equivalent of a Google Analytics Event Category. (ie..."Forms")
         * @param {String} action       - The equivalent of a Google Analytics Event Action (ie..."Submit")
         * @param {String} label        - The equivalent of a Google Analytics Event Label (ie..."Email Sign Up")
         * @param {Number} value        - The equivalent of a Google Analytics Event Value (ie....2)
         */
        trackEvent: function(category, action, label, value){
            if (this._ready){
                this.service.trackEvent(category, action, label, value);
            }
            else {
                var data = { type: "event", args: arguments }
                this._queue.push(data);
                this._logger.console.info(this._logger.name + ": Adding Event to Queue.", data);
            }
        },

        /**
         * Tracks the equivalent of a Google Analytics Pageview. If the Service is ready, we track it immediately. If it
         * is not yet ready, then we are adding the request to our queue. Events added to the queue will be called 
         * immediately (and in order) as soon as the Service is ready.
         *
         * Please note, to mirror Google Analytics implementation, we are allowing you to optionally override the url and 
         * title associated with the "pageview".
         * 
         * @access public
         * @param {String} url          - Optional. A url to track instead of the current url.
         * @param {String} title        - Optional. A page title to track instead of the current page's title.
         */
        trackPageview: function(url, title){
            if (this._ready){
                this.service.trackPageview(url, title);
            }
            else {
                var data = { type: "pageview", args: arguments }
                this._queue.push(data);
                this._logger.console.info(this._logger.name + ": Adding Pageview to Queue.", data);
            }
        }
    };

    // ============================================================================================================
    // =============== SERVICE ====================================================================================
    // ============================================================================================================
    /**
     * The Service class abstracts and encapsulates the loading, configuraiton and implementation of the Keen IO 
     * tracking library. There's a lot going on in here, so please read the below documentation carefully before 
     * making any alterations. Please note, this class loads additional script(s) asynchronously, so we have to 
     * wait until its fully loaded and ready before handling any API requests.
     *
     * For more information regarding the Keen IO tracking library, please visit...
     * <https://github.com/keen/keen-tracking.js>
     * 
     * @constructor
     * @access internal
     * @param {Model} model         - The shared Model instance containing shared settings and components.
     * @param {Function} callback   - A callback function to fire once the Service is ready to receive and track API requests.
     */
    var Service = function(model, callback){
        this.model = model;
        this._callback = callback;
        this._logger = this.model.logger;
        // shortcut
        this._config = this.model.settings.keen;
        // Pageview and Event Payload Normalizer and Whitelist validator
        this._normalizer = new Normalizer(this.model);
        // Loading and ready flags so we only ever try to load the Keen IO library once.
        this.ready = false;
        this.loading = false;
        // The full Keen IO libary (static)
        this.Keen = null;
        // The actual Keen IO instance
        this.client = null;
        // Keen IO session helper utilities
        this.session = {
            cookie: null,
            timer: null
        };
    };

    Service.prototype = {

        /**
         * Startup, load and initialize the Keen IO library. Please note, this method can only be called once – ensuring that the 
         * Keen IO library cannot be loaded more than once, or attempted to reload while it is currently loaded. Once the additional 
         * script(s) have been loaded and are ready, the `Keen.ready()` method will be called kicking off our additional configuration
         * and setup.
         * 
         * @access public
         */
        start: function(){
            // If its not ready, and its not currently loading – go ahead and load it!
            if (!this.ready && !this.loading){
                var self = this;
                // lock during loading
                this.loading = true;
                // Load the Keen IO library script, and install it to the `this` namespace. (ie...our Service instance)
                this._logger.console.info(this._logger.name + ": Loading Keen IO Library.");
                this._load("Keen", this._config.scriptUrl, this);
                // When the library has loaded and is ready...
                this.Keen.ready(function(){
                    // Mark loading complete
                    self.loading = false;
                    // Setup and Configure the Keen IO library/instance
                    self._configure();
                    // Mark as ready
                    self.ready = true;
                    self._logger.console.info(self._logger.name + ": Loading Keen IO Library Complete.");
                    // If a ready callback exists (which it should!) then fire it to notify the BentoAnalytics API instance that we're 
                    // ready to start receiving and tracking event!
                    if (self._callback){
                        self._callback();
                        self._callback = null;
                    }
                });
            }
        },

        /**
         * Tracks the equivalent of a Google Analytics Event. Please note, the method arguments are run through our Normalizer which 
         * checks that the requested arguments are allowed ("whitelisted"), validates that they meet the requirements of the "whitelist", 
         * and "normalizes" the final output that will be sent – ensuring that all similar "arguments" are grouped together appropriately.
         * 
         * @access public
         * @param {String} category     - The equivalent of a Google Analytics Event Category. (ie..."Forms")
         * @param {String} action       - The equivalent of a Google Analytics Event Action (ie..."Submit")
         * @param {String} label        - The equivalent of a Google Analytics Event Label (ie..."Email Sign Up")
         * @param {Number} value        - The equivalent of a Google Analytics Event Value (ie....2)
         */
        trackEvent: function(category, action, label, value){
            if (this.ready){
                var self = this;
                this._logger.console.group(this._logger.name + ": Running Service.trackEvent().");
                // normalize payload
                var data = this._normalizer.event(category, action, label, value);
                // If data is provided, send it!
                if (data) {
                    this.client.recordEvent("event", data, function(err, res){
                        if (err) self._logger.console.error(self._logger.name + ": Event Keen.recordEvent() Error.", err);
                        else self._logger.console.info(self._logger.name + ": Event Keen.recordEvent() Successful.", res);
                    });
                }
                // If no data is provided, do nothing.
                else {
                    this._logger.console.warn(self._logger.name + ": None or invalid data provided to Service.trackEvent(). Request ignored.");
                }
                this._logger.console.groupEnd();
            }
            else {
                this._logger.console.warn(this._logger.name + ": Service.trackEvent() called before Service is ready. Ignoring request.");
            }
        },

        /**
         * Tracks the equivalent of a Google Analytics Pageview. Please note, to mirror Google Analytics implementation, we are allowing you 
         * to optionally override the url and title associated with the "pageview". Those optional arguments will be run through our 
         * Normalizer to create a properly structured payload object (if they exist).
         * 
         * @access public
         * @param {String} url          - Optional. A url to track instead of the current url.
         * @param {String} title        - Optional. A page title to track instead of the current page's title.
         */
        trackPageview: function(url, title){
            if (this.ready){
                var self = this;
                this._logger.console.group(this._logger.name + ": Running Service.trackPageview().");
                // normalize payload
                var data = this._normalizer.pageview(url, title);
                this._logger.console.info(this._logger.name + ": Normalized Pageview Payload Overrides.", JSON.parse(JSON.stringify(data)));
                // send it!
                this.client.recordEvent("pageview", data, function(err, res){
                    if (err) self._logger.console.error(self._logger.name + ": Pageview Keen.recordEvent() Error.", err);
                    else self._logger.console.info(self._logger.name + ": Pageview Keen.recordEvent() Successful.", res);
                });
                this._logger.console.groupEnd();
            }
            else {
                this._logger.console.warn(this._logger.name + ": Service.trackPageview() called before Service is ready. Ignoring request.");
            }
        },

        /**
         * Loads the Keen IO library `<script>` asynchronously. Please note, there is a problem with Keen's recommended loading usage. If left 
         * untouched, it inserts the `<script>` tag above and OUTSIDE the `<head>` tag – so, its not inside the `<head>` or the `<body>` which 
         * may have unexpected results in different browsers. For clarity, we commented out the recommended code and added our own version. 
         * The singular notable change is...
         *
         *      Changed: `h.parentNode.insertBefore(s,h)}}` to `h.insertBefore(s,null)}}`
         * 
         * @access private
         * @see                         <https://github.com/keen/keen-tracking.js#install-the-library>
         * @param {String} name         - Define a custom namespace for the library, intead of the default `Keen`.
         * @param {String} path         - Define the location of the script to load. We don't have to rely on Keen's CDN if we don't want to.
         * @param {Object} ctx          - Define where the library should be installed. Global pollution is a problem. This helps you fight back.
         */
        _load: function(name, path, ctx){
            // var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.parentNode.insertBefore(s,h)}}
            var latest,prev=name!=='Keen'&&window.Keen?window.Keen:false;ctx[name]=ctx[name]||{ready:function(fn){var h=document.getElementsByTagName('head')[0],s=document.createElement('script'),w=window,loaded;s.onload=s.onerror=s.onreadystatechange=function(){if((s.readyState&&!(/^c|loade/.test(s.readyState)))||loaded){return}s.onload=s.onreadystatechange=null;loaded=1;latest=w.Keen;if(prev){w.Keen=prev}else{try{delete w.Keen}catch(e){w.Keen=void 0}}ctx[name]=latest;ctx[name].ready(fn)};s.async=1;s.src=path;h.insertBefore(s,null)}}
        },

        /**
         * Sets up and configures the Keen IO library and instance. Please note, the following configuration is very similar to "Example Setup" 
         * in the Keen documentation. Instead of explaining everything here, please read the inline comments below very carefully to fully 
         * understand what we're doing.
         * 
         * @access private
         * @see                         <https://github.com/keen/keen-tracking.js#example-setup>
         */
        _configure: function(){
            // Enable/disable Keen's internal debug console output. (its very sparse and limited)
            this.Keen.debug = this.model.settings.meta.devMode;
            // If you set this to false, no network requests will be made.
            this.Keen.enabled = true;
            // Creates the main Keen API instance that we'll be using throughout.
            this._createClient();
            // Creates page/session utility helpers.
            this._createSessionCookie();
            this._createSessionTimer();
        },

        /**
         * Creates our main `Keen` API instance. This is where most of the magic happens!
         * 
         * @access private
         * @see                         <https://github.com/keen/keen-tracking.js#example-setup>
         */
        _createClient: function(){
            var self = this;

            // Create the API instance with our project credentials.
            this.client = new this.Keen({
                projectId: self._config.projectId,
                writeKey: self._config.writeKey
            });

            // If `devMode=true`, we want to log our Keen requests as well as the payload we're sending. Keen's internal debug mode doesn't 
            // print much at all, so this allows a more verbose view of what's going on.
            if (this.model.settings.meta.devMode){
                this.client.on("recordEvent", function(eventCollection, extendedEventBody){
                    self._logger.console.group(self._logger.name + ": Running Keen.recordEvent()");
                    self._logger.console.info(self._logger.name + ": Keen.recordEvent() Collection", eventCollection);
                    self._logger.console.info(self._logger.name + ": Keen.recordEvent() Payload", JSON.parse(JSON.stringify(extendedEventBody)));
                    self._logger.console.groupEnd();
                });    
            }
            
            // The following object, parameters, and all corresponding data will be sent with EVERY Keen request. The following object is 
            // the "base" object – meaning any parameters passed to `recordEvent()` will overwrite what's below. Please note the use of 
            // "addons", which will further parse and expand the data structure on the server-side – meaning, you will not see the results 
            // of those "addon filters" in the payload.
            this.client.extendEvents(function(){
                return {
                    account: {
                        name: self.model.settings.meta.account,
                        theme: self.model.settings.meta.theme
                    },
                    page: {
                        title: document.title,
                        url: document.location.href
                    },
                    referrer: {
                        url: document.referrer
                    },
                    tech: {
                        browser: self.Keen.helpers.getBrowserProfile(),
                        ip: "${keen.ip}",
                        ua: "${keen.user_agent}"
                    },
                    time: self.Keen.helpers.getDatetimeIndex(),
                    visitor: {
                        id: self.session.cookie.get("user_id"),
                        time_on_page: self.session.timer.value()
                    },
                    keen: {
                        timestamp: new Date().toISOString(),
                        addons: [
                            {
                                name: "keen:ip_to_geo",
                                input: { ip: "tech.ip" },
                                output: "geo"
                            },
                            {
                                name: "keen:ua_parser",
                                input: { ua_string: "tech.ua" },
                                output: "tech.info"
                            },
                            {
                                name: "keen:url_parser",
                                input: { url: "page.url" },
                                output: "page.info"
                            },
                            {
                                name: "keen:referrer_parser",
                                input: {
                                    page_url: "page.url",
                                    referrer_url: "referrer.url"
                                },
                                output: "referrer.info"
                            }
                        ]
                    }
                }
            });
        },

        /**
         * Creates a session cookie that stores a unique "user_id" – allowing us to identify events on subsequent 
         * page visitors to map to the same user.
         * 
         * @access private
         */
        _createSessionCookie: function(){
            this.session.cookie = this.Keen.utils.cookie(this._config.cookieName);
            if (!this.session.cookie.get("user_id")) {
                this.session.cookie.set("user_id", this.Keen.helpers.getUniqueId());
            }
        },

        /**
         * Creates a page/session timer. This allows us add a timestamp to each action. This is most useful when 
         * using `deferEvents()` and `recordDefferedEvents()` – where the payload might not be sent immediately. 
         * (Note: We are not currently using those methods, but we might in the future)
         * 
         * @access private
         */
        _createSessionTimer: function(){
            this.session.timer = this.Keen.utils.timer();
            this.session.timer.start();
        }
    };

    // ============================================================================================================
    // =============== NORMALIZER : WHITELIST =====================================================================
    // ============================================================================================================
    /**
     * The Normalizer class is intended to take the various data formats passed from the different themes, and 
     * convert them into standard events. This class also acts as a "whitelist" for events that are allowed to be 
     * tracked. A few examples might be easier to understand...
     *
     * 1. One theme might track a form submission as `{ category: "Forms", action: "Submit" }`, and another theme 
     *    might track `{ category: "MyForm", action: "Submitted" }`. Those subtle differences would result in two 
     *    (or more) sets of data – even though they are the same thing...making it difficult to get a good overview 
     *    of "Form Submission" activity across all themes. The Normalizer "normalizes" that data so that it tracks 
     *    `{ category: "Forms", action: "Submit" }` for both – as long as their formats are added to the whitelist.
     *
     * 2. Some themes might track things we don't care about (or not yet) from an "all themes" perspective such as – 
     *    `{ category: "eCom", action: "Add to Cart" }`. By not including it in the "whitelist", it will not be 
     *    allowed to be sent to Keen IO. 
     * 
     * @constructor
     * @access internal
     * @param {Model} model         - The shared Model instance containing shared settings and components.
     */
    var Normalizer = function(model){
        this.model = model;
        this._logger = this.model.logger;

        // Events Whitelist and Normalization
        // Events are processed as a heirarchy – Category > Action > Label > Value. At any tier, if `validate=true`, 
        // the corresponding parameter will be checked to see if its allowed, and then move on to validating its 
        // children in the heirarchy. If along the way any tier is invalid, it will invalidate the entire request and 
        // nothing will be sent. If at any tier, `validate=false`, that tier's data (and all its children's data) will 
        // not be processed and be allowed to pass through as-is.
        this._events = {
            categories: {
                validate: true,
                regexp: new RegExp(
                        "(^forms$)|" +
                        "(^add to cart$)|" + 
                        "(^online ordering|chow\\s?now$)|" + 
                        "(^email sign\\s?up trigger button$)|" + 
                        "(^reservations trigger button$)|" + 
                        "(^social icons$)|" + 
                        "(^phone number$)|" + 
                        "(^address$)|" + 
                        "(^resy:\\s\\d+$)",
                    "i"),
                list: [
                    {
                        id: "Forms",
                        actions: {
                            validate: true,
                            regexp: /(^submit$)/i,
                            list: [
                                {
                                    id: "Submit",
                                    labels: {
                                        validate: true,
                                        regexp: /(^reservations.*$)|(^jobs$)|(^contact$)|(^catering$)|(^private events$)|(^email sign\s?up$)/i,
                                        list: [
                                            { id: "Reservations",   values: { validate: false } },
                                            { id: "Jobs",           values: { validate: false } },
                                            { id: "Contact",        values: { validate: false } },
                                            { id: "Catering",       values: { validate: false } },
                                            { id: "Private Events", values: { validate: false } },
                                            { id: "Email Sign Up",  values: { validate: false } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        id: "Add To Cart",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [
                                {
                                    id: "Click",
                                    labels: {
                                        validate: true,
                                        regexp: /(^ecom$)|(^gift card[s]?$)/i,
                                        list: [
                                            { id: "eCom",           values: { validate: false } },
                                            { id: "Gift Cards",     values: { validate: false } }
                                        ]
                                    }
                                }
                            ]
                        }
                    },
                    {
                        id: "Online Ordering",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: "Email Sign Up Trigger Button",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: "Reservations Trigger Button",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: "Social Icons",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: "Phone Number",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: "Address",
                        actions: {
                            validate: true,
                            regexp: /(^click$)/i,
                            list: [{ id: "Click",      labels: { validate: false } }]
                        }
                    },
                    {
                        id: function(category, data){
                            // ex: "Resy: 199"
                            data.location = category.split(" ")[1]; // add a `location` property using the venueId
                            return "Resy"; // return the category id
                        },
                        actions: {
                            validate: true,
                            regexp: /(^reservation placed$)/i,
                            list: [{ id: "Reservation Placed",      labels: { validate: false } }]
                        }
                    }
                ]
            }
        }
    };

    Normalizer.prototype = {

        /**
         * If `url` or `title` is provided, returns a normalized object that will be used to override the "base" 
         * Keen IO event data defined in `extendEvents()` when tracking a "pageview". The method is intended to 
         * mirror Google Analytics implementation by allowing us to optionally override the url and title 
         * associated with the "pageview".
         * 
         * @access public
         * @param {String} url          - Optional. A url to track instead of the current url.
         * @param {String} title        - Optional. A page title to track instead of the current page's title.
         * @returns {Object}            - If either parameter is provided – returns an object. If not, an empty object.
         */
        pageview: function(url, title){
            var data = {};
            if (title) data.title = title;
            if (url) data.url = url;
            return (title || url) ? { page: data } : data;
        },

        /**
         * Normalizes, validates and checks the equivalent of a Google Analytics Event versus our "whitelist". The intention 
         * of this method is to only track what we want to track, and how we want to track an event – regardless of which 
         * theme provides the parameters. Please read the Normalizer class documentation for examples that better define what 
         * this method does.
         * 
         * @access public
         * @param {String} category     - The equivalent of a Google Analytics Event Category. (ie..."Forms")
         * @param {String} action       - The equivalent of a Google Analytics Event Action (ie..."Submit")
         * @param {String} label        - The equivalent of a Google Analytics Event Label (ie..."Email Sign Up")
         * @param {Number} value        - The equivalent of a Google Analytics Event Value (ie....2)
         */
        event: function(category, action, label, value){
            // default values. assume initial data payload is valid.
            var valid = true;
            var data = {
                category: category,
                action: action,
                label: label,
                value: value
            };

            // start normalize log group
            this._logger.console.group(this._logger.name + ": Normalizing Event.");
            this._logger.console.info(this._logger.name + ": Pre-Normalized Event Payload.", JSON.parse(JSON.stringify(data)));

            // If we are validating categories...
            if (this._events.categories.validate){
                // Find the "category's" corresponding category node
                var categoryNode = this._findEventNode(category, this._events.categories);
                
                // If we found the corresponding category node...
                if (categoryNode){
                    // capture the category data
                    data.category = this._parseEventNodeId(categoryNode.id, category, data);
                    this._logger.console.info(this._logger.name + ": Category Found.", data.category);

                    // If we are validating this category's actions...
                    if (categoryNode.actions.validate){
                        // Find the "action's" corresponding action node
                        var actionNode = this._findEventNode(action, categoryNode.actions);
                        
                        // If we found the corresponding action node...
                        if (actionNode){
                            // capture the action data
                            data.action = this._parseEventNodeId(actionNode.id, action, data);
                            this._logger.console.info(this._logger.name + ": Action Found.", data.action);

                            // If we are validating this action's labels...
                            if (actionNode.labels.validate){
                                // Find the "label's" corresponding label node
                                var labelNode = this._findEventNode(label, actionNode.labels);
                                
                                // If we found the corresponding label node...
                                if (labelNode){
                                    // capture the label data
                                    data.label = this._parseEventNodeId(labelNode.id, label, data);
                                    this._logger.console.info(this._logger.name + ": Label Found.", data.label);

                                    // If we are validating this label's values...
                                    if (labelNode.values.validate){
                                        // Note: values can only be a Number per Google Analytics
                                        if (!isNaN(parseFloat(value)) && isFinite(value)) {
                                            // capture the value data
                                            data.value = value;
                                            this._logger.console.info(this._logger.name + ": Value Found.", data.value);
                                        }
                                        // value validation failed
                                        else {
                                            valid = false;
                                            this._logger.console.warn(this._logger.name + ": Value Validation Failed.");
                                        }
                                    }
                                    // don't validate value
                                    else {
                                         this._logger.console.info(this._logger.name + ": Value Validation Disabled. Adding remain tiers as-is.");
                                    }
                                }
                                // label validation failed
                                else {
                                    valid = false;
                                    this._logger.console.warn(this._logger.name + ": Label Validation Failed.");
                                }
                            }
                            // don't validate label
                            else {
                               this._logger.console.info(this._logger.name + ": Label Validation Disabled. Adding remain tiers as-is.");
                            }
                        }
                        // action validation failed
                        else {
                            valid = false;
                            this._logger.console.warn(this._logger.name + ": Action Validation Failed.");
                        }
                    }
                    // don't validate action
                    else {
                        this._logger.console.info(this._logger.name + ": Label Validation Disabled. Adding remain tiers as-is.");
                    }
                }
                // category node failed
                else {
                    valid = false;
                    this._logger.console.warn(this._logger.name + ": Category Validation Failed.");
                }
            }
            // don't validate category
            else {
                this._logger.console.info(this._logger.name + ": Category Validation Disabled. Adding remain tiers as-is.");
            }

            // clean the resulting payload
            var obj = this._cleanEventPayload(data);
            var payload = (valid && obj) ? { event: obj } : null;

            // log resulting payload
            if (payload) this._logger.console.info(this._logger.name + ": Post-Normalized Event Payload.", JSON.parse(JSON.stringify(payload)));
            else this._logger.console.warn(this._logger.name + ": Post-Normalized Event Payload is invalid.");
            this._logger.console.groupEnd();

            // return the payload!
            return payload;
        },

        /**
         * Tests a value against the corresponding RegExp (per the corresponding/provided tier object). If a match 
         * is found, the index of the Capture Group is used to find the corresponding "next child tier" object. This 
         * method allows us to quickly traverse the tier tree and validate everything all the way down to the bottom.
         * 
         * @access private
         * @param {String} value        - The current tier value being tested.
         * @param {Object} obj          - The current categories|actions|labels|etc tier object to test against.
         * @returns {Object}            - The matching tier object if found. `null` if not.
         */
        _findEventNode: function(value, obj){
            if (value && obj){
                // Test value against the current tier's RegExp.
                var matches = obj.regexp.exec(value);
                // If a match is found...
                if (matches && (matches.length > 1)){
                    // Loop through all the matches. Note, Capture Group matches start at Array[1].
                    for (var i=1; i<matches.length; i++){
                        // If a Capture Group is found that corresponds to a tier's `list` item, return that "child 
                        // tier object".
                        if (matches[i] && ((i-1) < obj.list.length)) {
                            return obj.list[i-1];
                        }
                    }
                }
            }
            return null;
        },

        /**
         * Parses and returns the Event Node's Id. Each node id can be provided as either a `String` or as a `Function`. 
         * The reason is – it might not always be appropriate to use the current id as a broad group, and/or the value 
         * has information that needs to be captured as well. We also are providing the `Function` the `data` node that 
         * is currently being built and normalized so we have the opportunity to add additional data properties.
         * For example...
         *
         * Resy event categories are tracked as `Resy: [Venue Id]`, and the RegExp is `(^resy:\\s\\d+$)`. We want all 
         * Resy actions grouped, but we don't want to completely loose the [Venue Id]. This method allows us to the 
         * opportunity to grab the [Venue Id] and create a new `data.location = venueId` property to be captured.
         * 
         * @access private
         * @param {String|Function} id      - The current node's id property. If its a string, use it directly. If its a function, run it.
         * @param {String} value            - The current string that has been tested and matched.
         * @param {Object} data             - The current `data` object being built and normalized.
         * @returns {String}                - The final node id value.
         */
        _parseEventNodeId: function(id, value, data){
            return (typeof id === "function") ? id(value, data) : id;
        },

        /**
         * Cleans/simplifies the final output object so we don't pass any key/value pairs that have `null` or 
         * `undefined` values. This is accomplished by copying over all valid key/value pairs to a new object. If 
         * at least one valid key/value pair is copied, we return the new object. If not, the payload is invalid and 
         * we shouldn't be sending the event at all!
         * 
         * @access private
         * @param {Object} value        - The "raw" payload object we intend to pass to `recordEvent()`.
         * @returns {Object}            - If valid, the "cleaned" payload object. If not, `null`.
         */
        _cleanEventPayload: function(obj){
            if (obj){
                var data = {};
                var valid = false;
                // Loop through all the keys in the payload object...
                for (var prop in obj){
                    // If the value valid, copy it to our new data object and mark the payload as valid.
                    if (obj[prop] !== null && obj[prop] !== undefined){
                        data[prop] = obj[prop];
                        valid = true;
                    }
                }
                // If the payload is valid, return the new "cleaned" data object. If not, return `null`.
                return (valid) ? data : null;
            }
            // If no payload object was provided, just return `null`.
            return null;
        }
    };

    // ============================================================================================================
    // =============== LOGGER =====================================================================================
    // ============================================================================================================
    /**
     * The Logger class is intended be a toggleable way to display BentoAnalytics-specific information in the 
     * console based on whether or `devMode/enabled` is `true` or `false`. If enabled, all Logger requests will be 
     * passed through to the `console`. If disabled, all Logger requests are routed through a "muted console" object 
     * that won't attempt to print anything.
     *
     * Sample Usage:
     *     `this.model.logger.console.info(this.model.logger.name + ": Hello World!");`
     *
     * Important Notes:
     * - Its ok to use `console.log` directly throughout this package for development purposes. However, any 
     *   `console` messages that you intend to maintain in the production environment (ie...devMode) should use the 
     *   Logger class to maintain consistency.
     * - For simplicity, every class in this package uses a single shared instance of the logger. This makes 
     *   initialization a bit easier.
     *
     * TODO:
     * - This class could be further encapsulated/hidden/simplified if it was converted to a private object 
     *   instantiated immediately inside our self-executing function. This would also ensure that the "outside world" 
     *   cannot access this instance and make alternations.
     * 
     * @constructor
     * @access internal
     * @param {String} name         - The name to associate with the Logger. (Can be used to identify `console` items/groups)
     * @param {Boolean} enabled     - True if allowed to print to `console`. False if not.
     */
    var Logger = function(name, enabled){
        this.name = name;
        this.enabled = enabled;
        this.console = null;

        this._init();
    };

    Logger.prototype = {

        /**
         * Startup and initialize. If enabled, pass all calls to `window.console`. If false, create a "muted console".
         * @access private
         */
        _init: function(){
            this.console = (this.enabled && window.console) ? window.console : this._createMutedConsole();
        },

        /**
         * Creates a "muted console" object with all the relevant `console` methods attached – which do nothing. Please 
         * note, not all the `console` methods are included because these are the only ones we're using. If you need 
         * more, please add them to the `methods` array.
         * @access private
         */
        _createMutedConsole: function(){
            var mutedConsole = {};
            var methods = ["error", "group", "groupCollapsed", "groupEnd", "info", "log", "warn"];
            for (var i=0; i<methods.length; i++) mutedConsole[methods[i]] = function(){};
            return mutedConsole;
        }
    };

    // Add it to the `window` and start it up! Please note, we are only directly exposing the `BentoAnalytics` instance.
    window.BentoAnalytics = window.BentoAnalytics || new BentoAnalytics();

})();

