define(
[
    "underscore",
    "backbone",
    "TP",
    "testUtils/xhrDataStubs",
    "app"
],
function(_, Backbone, TP, xhrData, MarsApp)
{

    var testHelpers = {

        theApp: new MarsApp({"$body": $("<body></body>")}),

        setupRegionElements: function()
        {
            this.theApp.navRegion.$el = $("<div id='navigation'></div>");
            this.theApp.mainRegion.$el = $("<div id='main'></div>");
            this.theApp.infoRegion.$el = $("<div id='info'></div>");
            this.theApp.$body.append(this.theApp.navRegion.$el);
            this.theApp.$body.append(this.theApp.mainRegion.$el);
            this.theApp.$body.append(this.theApp.infoRegion.$el);
        },

        startTheApp: function()
        {
            //console.log("Starting the app");
            var startTime = +new Date();

            this.stopTheApp();

            this.theApp = window.theMarsApp = new MarsApp({"$body": $("<body></body>")});

            // capture ajax calls
            this.setupFakeAjax();

            // backbone history doesn't work well with our tests for some reason
            this.theApp.historyEnabled = false;

            // disable fade in/out timeouts for all layouts
            TP.Layout.prototype.fadeIn = false;
            TP.Layout.prototype.fadeOut = false;

            // setup fake html regions, so it doesn't look for them on the html page and so we can reach them for testing
            this.theApp.on("initialize:before", this.setupRegionElements, this);

            // start the app
            this.theApp.start();

            // flag as started so we know whether to shut it down
            this.theApp.started = true;
        },

        stopTheApp: function()
        {

            // if we have an application instance, do as much as possible to cleanup memory usage
            if (this.theApp && this.theApp.started)
            {

                // this has to happen before closing regions and controllers, or else some things don't get cleaned up
                this.theApp.$body.find("*").remove(); 
                this.theApp.$body.remove();

                _.each(this.theApp.controllers, function(controller)
                {
                    controller.close();
                });

                this.theApp._regionManager.closeRegions();
                this.theApp.dataManager.forceReset();
                this.theApp.calendarManager.stopListening();
                Backbone.history.stop();
                Backbone.history.handlers = [];
            }

            // remove any html elements and event handlers that were added to the body, document, and window either by the app or by jquery plugins
            $("body > *:not(#mocha)").remove();
            $("body").off();
            $(document).off();
            $(window).off();

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
                throw Error("Cannot find request to resolve: " + httpVerb + " " + urlPattern);
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
            return _.find(this.fakeAjaxRequests, function(req)
            {
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
            _.each(this.fakeAjaxRequests, function(xhr) {
                xhr.respond(500, [], "");
            });
            this.fakeAjaxRequests = [];
        },

        setupFakeAjax: function()
        {
            var self = this;

            if(this.xhr)
            {
                return;
            }

            $.support.cors = true;
            this.fakeAjaxRequests = [];
            window.fakeXhr.onCreate = function(xhr)
            {
                self.fakeAjaxRequests.push(xhr);
            };
        },

        removeFakeAjax: function()
        {
            if(window.fakeXhr)
            {
                window.fakeXhr.onCreate = null;
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

    return testHelpers;

});
