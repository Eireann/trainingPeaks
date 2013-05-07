define(
[
    "underscore",
    "jquery",
    "backbone",
    "TP",
    "testUtils/xhrDataStubs",
    "app",

],
function(_, $, Backbone, TP, xhrData, app)
{

    return {

        setupRegionElements: function()
        {
            this.navRegion.$el = $("<div id='navigation'></div>");
            this.mainRegion.$el = $("<div id='main'></div>");
        },

        reset: function()
        {
            app.ajaxCachingEnabled = false;
            this.removeFakeAjax();
            app.resetAppToInitialState();
        },

        startTheApp: function()
        {

            // ajaxCaching doesn't play nicely with our fake xhr ...
            app.ajaxCachingEnabled = false;
            app.resetAppToInitialState();

            // disable window reload
            app.reloadApp = function() { };

            // disable fade in/out timeouts for all layouts
            TP.Layout.prototype.fadeIn = false;
            TP.Layout.prototype.fadeOut = false;

            // setup fake html regions
            app.on("initialize:before", this.setupRegionElements, app);

            // start the app
            app.start();

            // unless it was already started
            try
            {
                TP.history.start({ pushState: false, root: app.root });
            } catch(e)
            {
                //console.log("Ignoring history already started");
            }

            // go to #logout, even though it doesn't really exist, so then we can navigate to login or anywhere else
            app.router.navigate("logout", true);
        },

        fakeAjax: function(url, options)
        {
            if (_.isObject(url))
            {
                options = url;
                url = options.url;
            }

            options.testHelpersDeferred = new $.Deferred();
            var jqXhr = Backbone.$.ajax.apply(Backbone.$, arguments);
            var deferredFunctionNames = ["always", "done", "fail", "pipe", "progress", "then"];

            _.each(deferredFunctionNames, function(httpVerbName)
            {
                var originalJqMethod = jqXhr[httpVerbName];
                var ajaxDeferredMethod = options.testHelpersDeferred[httpVerbName];
                jqXhr[httpVerbName] = function()
                {
                    // apply on our cached data first
                    ajaxDeferredMethod.apply(options.testHelpersDeferred, arguments);

                    // then apply on our server data
                    originalJqMethod.apply(jqXhr, arguments);

                    return this;
                };
            }, this);
            this.fakeAjaxRequests[url] = {
                url: url,
                jqXhr: jqXhr,
                options: options
            };

            //console.log("Fake XHR: " + url);
            return jqXhr;

        },

        resolveRequest: function(httpVerb, urlPattern, data)
        {
            var request = this.findRequest(httpVerb, urlPattern);
            if (request)
            {
                //console.log("Resolving request " + request.url);
                request.options.testHelpersDeferred.resolveWith(request.options, [data, 'success', request.jqXhr]);
            } else
            {
                throw "Cannot find request to resolve: " + httpVerb + " " + urlPattern;
            }
        },

        hasRequest: function(httpVerb, urlPattern)
        {
            var request = this.findRequest(httpVerb, urlPattern);
            return request ? true : false;
        },

        findRequest: function(httpVerb, urlPattern)
        {
            var pattern = new RegExp(urlPattern);
            var request = _.find(_.values(this.fakeAjaxRequests), function(req)
            {
                if(pattern.test(req.url) && (!httpVerb || req.options.type === httpVerb))
                {
                    return true;
                }
            }, this);
            return request;
        },

        setupFakeAjax: function()
        {
            _.bindAll(this, "fakeAjax");

            if (!Backbone._originalAjax)
                Backbone._originalAjax = Backbone.ajax;

            Backbone.ajax = this.fakeAjax;
            this.fakeAjaxRequests = [];
        },

        removeFakeAjax: function()
        {
            if (Backbone._originalAjax)
                Backbone.ajax = Backbone._originalAjax;
        },

        submitLogin: function(userData)
        {
            app.router.navigate("logout", true);
            app.router.navigate("login", true);
            app.mainRegion.$el.find("input[name=Submit]").trigger("click");
            this.resolveRequest("POST", "Token", xhrData.token);
            this.resolveRequest("GET", "users/v1/user", userData);
        }

    };

});