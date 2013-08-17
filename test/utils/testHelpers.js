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
            this.infoRegion.$el = $("<div id='info'></div>");
            this.$body.append(this.navRegion.$el);
            this.$body.append(this.mainRegion.$el);
            this.$body.append(this.infoRegion.$el)

            // since we override the body element, may need to initialize events on it again
            this.watchForFirstTouch();
        },

        startTheApp: function()
        {
            var startTime = +new Date();
            this.stopTheApp();

            // ajaxCaching doesn't play nicely with our fake xhr ...
            app.ajaxCachingEnabled = false;

            // backbone history doesn't work well with our tests for some reason
            app.historyEnabled = false;

            app.resetAppToInitialState();
            // disable window reload
            var helper = this;
            app.reloadApp = function()
            {
                helper.startTheApp();
            };

            // disable fade in/out timeouts for all layouts
            TP.Layout.prototype.fadeIn = false;
            TP.Layout.prototype.fadeOut = false;

            // setup fake html regions
            app.on("initialize:before", this.setupRegionElements, app);

            // start the app
            app.start();

            // capture ajax calls
            this.setupFakeAjax();

            //console.log("StartTheApp took " + (+new Date() - startTime) + "ms");

        },

        stopTheApp: function()
        {
            if (app.started)
            {
                app.stop();
            }
            this.removeFakeAjax();
            localStorage.clear();
        },

        fakeAjax: function(options)
        {

            // fire backbone ajax to get a jquery xhr deferred, and wrap it with our own deferred
            var ajaxDeferred = this.addDeferred(options, this.backboneAjax);

            // this is what actually triggers Backbone models/collections to ajax,
            // and is added in Backbone.ajax
            if (options.success)
                ajaxDeferred.done(options.success);

            this.fakeAjaxRequests[options.url] = {
                url: options.url,
                jqXhr: ajaxDeferred,
                options: options
            };

            //console.log("Fake request: " + options.type + " " + options.url);
            //console.log(options);

            return ajaxDeferred;
        },

        addDeferred: function(options, backboneAjax)
        {
            options.ajaxDeferred = new $.Deferred();
            var jqXhr = backboneAjax(options);
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

        deepClone: function(object)
        {
            if(_.isObject(object))
            {
                var newObject = {};
                _.each(_.keys(object), function(key)
                {
                    newObject[key] = this.deepClone(object[key]);
                }, this);
                return newObject;
            }
            else if(_.isArray(object))
            {
                var newArray = [];
                _.each(object, function(arrayItem)
                {
                    newArray.push(this.deepClone(arrayItem));
                }, this);
                return newArray;
            }
            else
            {
                return _.clone(object);
            }
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
            if(!httpVerb)
            {
                //console.log("testHelpers.hasRequest or testHelpers.resolveRequest, with a null http verb, will be deprecated soon");
            }
            var pattern = new RegExp(urlPattern);
            return _.find(_.values(this.fakeAjaxRequests), function(req)
            {
                if(pattern.test(req.url) && (!httpVerb || req.options.type === httpVerb))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }, this);
        },

        findAllRequests: function(httpVerb, urlPattern)
        {
            var pattern = new RegExp(urlPattern);
            return _.filter(_.values(this.fakeAjaxRequests), function(req)
            {
                if(pattern.test(req.url) && (!httpVerb || req.options.type === httpVerb))
                {
                    return true;
                }
                else
                {
                    return false;
                }
            }, this);
        },

        clearRequests: function()
        {
            this.fakeAjaxRequests = {};
        },

        setupFakeAjax: function()
        {
            _.bindAll(this, "fakeAjax");

            if (!Backbone._originalAjax)
            {
                Backbone._originalAjax = Backbone.ajax;
                this.backboneAjax = Backbone.ajax;
            }

            Backbone.ajax = this.fakeAjax;
            this.fakeAjaxRequests = {};
        },

        removeFakeAjax: function()
        {
            if (Backbone._originalAjax)
                Backbone.ajax = Backbone._originalAjax;

            this.clearRequests();
        },

        submitLogin: function(userData)
        {
            app.router.navigate("login", true);
            app.mainRegion.$el.find("input[name=Submit]").trigger("click");
            this.resolveRequest("POST", "Token", xhrData.token);
            this.loadUser(userData);
        },

        loadUser: function(userData)
        {
            if (userData)
            {
                this.resolveRequest("GET", "users/v1/user", userData);
            }
        },

        startTheAppAndLogin: function(userData, doClone)
        {

            this.startTheApp();
            if(doClone)
            {
                userData = this.deepClone(userData);                
            }

            this.submitLogin(userData);
        }

    };

});