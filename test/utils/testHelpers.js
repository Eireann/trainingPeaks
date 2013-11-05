define(
[
    "underscore",
    "backbone",
    "TP",
    "testUtils/xhrDataStubs",
    "testUtils/sinon",
    "app"
],
function(_, Backbone, TP, xhrData, sinon_, MarsApp)
{

    var testHelpers = {

        theApp: new MarsApp(),

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
            //console.log("Starting the app");
            var startTime = +new Date();

            this.stopTheApp();

            this.theApp = new MarsApp();

            // capture ajax calls
            this.setupFakeAjax();

            // ajaxCaching doesn't play nicely with our fake xhr ...
            this.theApp.ajaxCachingEnabled = false;

            // backbone history doesn't work well with our tests for some reason
            this.theApp.historyEnabled = false;

            // disable window reload
            var helper = this;
            this.theApp.reloadApp = function()
            {
                helper.startTheApp();
            };

            // disable fade in/out timeouts for all layouts
            TP.Layout.prototype.fadeIn = false;
            TP.Layout.prototype.fadeOut = false;

            // setup fake html regions
            this.theApp.on("initialize:before", this.setupRegionElements, this.theApp);

            // start the app
            this.theApp.start();
        },

        stopTheApp: function()
        {
            if (this.theApp)
            {
                this.theApp.stop();
            }

            this.removeFakeAjax();
            localStorage.clear();
        },

        resolveRequest: function(httpVerb, urlPattern, data)
        {
            var request = this.findRequest(httpVerb, urlPattern);

            if (request)
            {
                request.respond(200, {}, _.isString(data) ? data : JSON.stringify(data));
            }
            else
            {
                throw "Cannot find request to resolve: " + httpVerb + " " + urlPattern;
            }
        },

        resolveRequests: function(httpVerb, urlPattern, data)
        {
            var requests = this.findAllRequests(httpVerb, urlPattern);

            _.each(requests, function(request)
            {
                request.respond(200, {}, _.isString(data) ? data : JSON.stringify(data));
            });

            return requests;
        },

        rejectRequest: function(httpVerb, urlPattern)
        {
            var request = this.findRequest(httpVerb, urlPattern);

            if (request)
            {
                request.respond(500, null, null);
            }
            else
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
            //console.log(this.fakeAjaxRequests);
            return _.find(this.fakeAjaxRequests, function(req)
            {
                //console.log(req);
                if(pattern.test(req.url) && (!httpVerb || req.method === httpVerb))
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
            return _.filter(this.fakeAjaxRequests, function(req)
            {
                return pattern.test(req.url) && (!httpVerb || req.method === httpVerb);
            }, this);
        },

        clearRequests: function()
        {
            this.fakeAjaxRequests = [];
        },

        setupFakeAjax: function()
        {
            //console.log("SETUP FAKE AJAX");

            var self = this;

            if(this.xhr)
            {
                return;
            }

            $.support.cors = true;
            this.fakeAjaxRequests = [];
            this.xhr.onCreate = function(xhr)
            {
                //console.log(xhr);
                self.fakeAjaxRequests.push(xhr);
            };
        },

        removeFakeAjax: function()
        {
            if(this.xhr)
            {
                this.xhr.restore();
                this.xhr = null;
            }
            this.clearRequests();
        },

        submitLogin: function(userData, accessRights, athleteSettings)
        {
            this.loadUser(userData, accessRights, athleteSettings);
        },

        loadUser: function(userData, accessRights, athleteSettings)
        {
            this.resolveRequest("GET", "refresh$", {});
            this.resolveRequest("GET", "users/v1/user$", userData);
            this.resolveRequest("GET", "users/v1/user/accessrights", accessRights);
            this.resolveRequest("GET", "fitness/v1/athletes/[0-9]+/settings", athleteSettings);
        },

        startTheAppAndLogin: function(userData, accessRights, athleteSettings)
        {
            if(_.isBoolean(accessRights))
            {
                throw new Error("Deprecated: startTheAppAndLogin(userData, doClone)");
            }
            
            this.startTheApp();

            if(!_.isArray(accessRights))
            {
                accessRights = this.deepClone(xhrData.defaultTestUserAccessRights);
            }

            if(!_.isObject(athleteSettings))
            {
                athleteSettings = this.deepClone(xhrData.athleteSettings.barbkprem);
            }

            this.loadUser(userData, accessRights, athleteSettings);
        },

        deepClone: function(obj)
        {
            return TP.utils.deepClone(obj);
        }
    };

    testHelpers.theApp.start();
    testHelpers.setupRegionElements.call(testHelpers.theApp);

    return testHelpers;

});
