// use requirejs() here, not define(), for jasmine compatibility
define(
[
    "underscore",
    "jquery",
    "backbone",
    "TP",
    "app"
],
function(_, $, Backbone, TP, app)
{

    return {

        setupRegionElements: function()
        {
            this.navRegion.$el = $("<div id='navigation'></div>");
            this.mainRegion.$el = $("<div id='main'></div>");
        },

        startTheApp: function()
        {
            // disable window reload
            app.reloadApp = function() { };

            // disable fade in/out timeouts for all layouts
            TP.Layout.prototype.fadeIn = false;
            TP.Layout.prototype.fadeOut = false;

            // setup fake html regions
            app.on("initialize:before", this.setupRegionElements, app);

            // start the app
            app.start();
            TP.history.start({ pushState: false, root: app.root });

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

            _.each(deferredFunctionNames, function(methodName) {
                var originalJqMethod = jqXhr[methodName];
                var ajaxDeferredMethod = options.testHelpersDeferred[methodName];
                jqXhr[methodName] = function()
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

            console.log("Fake XHR: " + url);
            return jqXhr;

        },

        resolveRequest: function(urlPattern, data)
        {
            var pattern = new RegExp(urlPattern);
            _.each(_.keys(this.fakeAjaxRequests), function(url)
            {
                if(pattern.test(url))
                {
                    console.log("Resolving request " + url);
                    var request = this.fakeAjaxRequests[url];
                    request.options.testHelpersDeferred.resolveWith(request.options, [data, 'success', request.jqXhr]);
                }
            }, this);
        },

        setupFakeAjax: function()
        {
            _.bindAll(this, "fakeAjax");
            Backbone._ajax = Backbone.ajax;
            Backbone.ajax = this.fakeAjax;
            this.fakeAjaxRequests = [];
        },

        removeFakeAjax: function()
        {
            Backbone.ajax = Backbone._ajax;
        }

    };

});