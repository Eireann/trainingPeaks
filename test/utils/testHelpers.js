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
            this.$body = $("<body></body>");
            this.navRegion.$el = $("<div id='navigation'></div>");
            this.mainRegion.$el = $("<div id='main'></div>");
            this.$body.append(this.navRegion.$el);
            this.$body.append(this.mainRegion.$el);
        },

        startTheApp: function()
        {

            console.log("Starting the app");
            var startTime = +new Date();
            this.stopTheApp();
            // ajaxCaching doesn't play nicely with our fake xhr ...
            app.ajaxCachingEnabled = false;

            // backbone history doesn't work well with our tests for some reason
            app.historyEnabled = false;

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

            // capture ajax calls
            this.setupFakeAjax();

            console.log("Finished Starting The App: " + (+new Date() - startTime) + "ms");
        },

        stopTheApp: function()
        {
            if (app.started)
            {
                app.stop();
            }
            this.removeFakeAjax();
        },

        fakeSync: function(method, model, options)
        {
            // if no url was passed in, build one from the model
            if (!options.url)
                options.url = _.result(model, 'url');

            // fire backbone sync to get a jquery xhr deferred, and wrap it with our own deferred
            var ajaxDeferred = this.addDeferred(method, model, options, this.backboneSync);

            // this is what actually triggers Backbone models/collections to sync,
            // and is added in Backbone.sync
            if (options.success)
                ajaxDeferred.done(options.success);

            if (!options.type)
                options.type = "GET";

            this.fakeAjaxRequests[options.url] = {
                url: options.url,
                jqXhr: ajaxDeferred,
                options: options,
                model: model
            };

            //console.log("Fake request: " + options.type + " " + options.url);
            //console.log(options);

            return ajaxDeferred;
        },

        addDeferred: function(method, model, options, backboneSync)
        {

            options.ajaxDeferred = new $.Deferred();
            var jqXhr = backboneSync(method, model, options);
            jqXhr.ajaxDeferred = options.ajaxDeferred;

            var deferredFunctionNames = ["always", "done", "fail", "pipe", "progress", "then"];

            _.each(deferredFunctionNames, function(methodName)
            {
                var ajaxDeferredMethod = options.ajaxDeferred[methodName];
                jqXhr[methodName] = function()
                {
                    // apply on our cached data first
                    ajaxDeferredMethod.apply(options.ajaxDeferred, arguments);
                    return this;
                };
            }, this);

            var ajaxDeferredDone = options.ajaxDeferred.done;
            jqXhr.error = function()
            {
                // apply on our cached data first
                ajaxDeferredDone.apply(options.ajaxDeferred, arguments);
                return this;
            };

            return jqXhr;
        },

        resolveRequest: function(httpVerb, urlPattern, data)
        {
            var request = this.findRequest(httpVerb, urlPattern);
            if (request)
            {
                //console.log("Resolving request " + request.url);
                request.jqXhr.ajaxDeferred.resolveWith(request.options, [data, 'success', request.jqXhr]);
            } else
            {
                //console.log(this.fakeAjaxRequests);
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
            _.bindAll(this, "fakeSync");

            if (!Backbone._originalSync)
            {
                Backbone._originalSync = Backbone.sync;
                this.backboneSync = Backbone.sync;
            }

            Backbone.sync = this.fakeSync;
            this.fakeAjaxRequests = {};
        },

        removeFakeAjax: function()
        {
            if (Backbone._originalSync)
                Backbone.sync = Backbone._originalSync;
        },

        submitLogin: function(userData)
        {
            app.router.navigate("login", true);
            app.mainRegion.$el.find("input[name=Submit]").trigger("click");
            this.resolveRequest("POST", "Token", xhrData.token);
            this.resolveRequest("GET", "users/v1/user", userData);
        },

        startTheAppAndLogin: function(userData)
        {
            this.startTheApp();
            this.submitLogin(userData);
        }

    };

});