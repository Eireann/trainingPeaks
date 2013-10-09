define(
[
    "underscore",
    "jquery",
    "backbone",
    "TP",
    "testUtils/xhrDataStubs",
    "testUtils/sinon",
    "app"
],
function(_, $, Backbone, TP, xhrData, sinon_, app)
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
            if(!httpVerb)
            {
                //console.log("testHelpers.hasRequest or testHelpers.resolveRequest, with a null http verb, will be deprecated soon");
            }
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

        clearRequests: function()
        {
            this.fakeAjaxRequests = [];
        },

        setupFakeAjax: function()
        {
            var self = this;

            if(this.xhr)
            {
                return;
            }

            this.fakeAjaxRequests = [];
            this.xhr = sinon.useFakeXMLHttpRequest();

            this.xhr.onCreate = function(xhr)
            {
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

            this.submitLogin(userData, accessRights, athleteSettings);
        },

        deepClone: function(obj)
        {
            return TP.utils.deepClone(obj);
        }
    };

});
