define(
[
    "webfonts",
    "underscore",
    "jquery",
    "jqueryui/position",
    "backbone.marionette.handlebars",
    "flot/jquery.flot",
    "flot/jquery.flot.resize",
    "TP",
    "components/shared/apiConfigBuilder",
    "utilities/rollbarManager",
    "shared/patches/wrapForRollbar",
    "shared/models/userModel",
    "models/workoutModel",
    "models/workoutStatsForRange",
    "expando/models/expandoStateModel",
    "./lightweightFeatureAuthorizer",
    "./dateAndTimeView",
    "views/workout/workoutBarView",
    "./userProfileView",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "./emailCaptureView",
    "hbs!../templates/publicFileViewerTemplate"
],
function(
         webfonts,
         _,
         $,
         Position,
         bmhbs,
         Flot,
         FlotResize,
         TP,
         ApiConfigBuilder,
         RollbarManager,
         rollbarPatches,
         UserModel, 
         WorkoutModel,
         WorkoutStatsForRangeModel,
         ExpandoStateModel,
         LightweightFeatureAuthorizer,
         DateAndTimeView,
         WorkoutBarView,
         UserProfileView,
         GraphView,
         MapView,
         StatsView,
         LapsView,
         EmailCaptureView,
         publicFileViewerTemplate
         )
{

    var PublicFileViewer = TP.ItemView.extend({

        showThrobbers: false,

        subviews: [],

        template:
        {
            type: "handlebars",
            template: publicFileViewerTemplate 
        },

        initialize: function(options)
        {
            this.token = options.token;
            this.userType = options.userType ? Number(options.userType) : 0;
            this.capture = options.capture || false;
            this._setupApiConfig();
            this._setupRollbar();
            this._setupGoogleAnalytics();
            this._setupMarsApp();
            this._loadExternalStylesheets();
            this._loadExternalScripts();
        },

        load: function()
        {
            var publicWorkoutUrl = this.apiConfig.apiRoot + "/public/v1/workouts/" + this.token;

            WorkoutStatsForRangeModel.prototype.urlRoot = function() { return publicWorkoutUrl + "/"; };

            var ajaxOptions = {
                url: publicWorkoutUrl,
                type: "GET",
                contentType: "application/json",
            };

            var loadPromise = new $.Deferred();

            var self = this;
            $.ajax(ajaxOptions).done(function(data)
            {
                self._setupModels(data);
                self.render();
                loadPromise.resolve();
            });

            return loadPromise;
        },

        onRender: function()
        {

            webfonts.loadFonts();
            this.$el.addClass("pfvContainer");

            var options = {
                model: this.workout,
                detailDataPromise: new $.Deferred().resolve(),
                stateModel: new ExpandoStateModel()
            };

            this.renderHeader();
            this.renderExpandoPods(options);
            this.renderExpandoLeftColumn(options);

            if(this.capture)
            {
                this.renderCapture();
            }
        },

        renderHeader: function()
        {
            var dateAndTimeView = new DateAndTimeView({ model: this.workout });
            this.$(".workoutBarView").before(dateAndTimeView.render().$el);
            this.subviews.push(dateAndTimeView); 

            var workoutBarView = new WorkoutBarView({ model: this.workout });
            this.$(".workoutBarView").append(workoutBarView.render().$el);
            workoutBarView.$("input.workoutTitle").prop("disabled", true);
            this.subviews.push(workoutBarView);

            var userProfileView = new UserProfileView({ model: this.userModel, wwwRoot: this.apiConfig.wwwRoot });
            this.$(".QVHeaderProfile").append(userProfileView.render().$el);
            this.subviews.push(userProfileView);

            this._watchForWindowResize();
        },

        renderExpandoPods: function(options)
        {
            var pods = [
                {
                    podView: MapView,
                    cssClass: "expandoMapPod",
                    options: {
                        drag: !this._isMobile(),
                        touchZoom: !this._isMobile()
                    }
                },
                {
                    podView: GraphView,
                    cssClass: ""
                }
            ];

            _.each(pods, function(pod)
            {
                var view = new pod.podView(_.defaults({}, pod.options, options));
                this._appendExpandoPod(view, pod.cssClass);
                this.subviews.push(view);
            }, this);

        },

        renderExpandoLeftColumn: function(options)
        {
            var statsView = new StatsView(options);
            this.$(".expandoStatsRegion").append(statsView.render().$el); 
            this.subviews.push(statsView);

            var lapsView = new LapsView(options);
            this.$(".expandoLapsRegion").append(lapsView.render().$el);
            lapsView.onShow();
            this.subviews.push(lapsView);
        },

        renderCapture: function()
        {
            var capture = new EmailCaptureView(this.apiConfig);
            capture.render();
            var self = this;
            capture.on("close", function(){
                self.capture = false;
            });
        },

        _setupModels: function(data)
        {
            theMarsApp.user.set(data);
            this.userModel = theMarsApp.user; 
            this.workout = new WorkoutModel(data.workout);
            this.workout.get("detailData").set(data.workoutDetailData);
            this.workout.get("detailData").reset();
        },

        _setupApiConfig: function()
        {
            this.apiConfig = ApiConfigBuilder.buildApiConfig();
        },

        _setupRollbar: function()
        {
            window._rollbarParams =
            {
                "server.environment": this.apiConfig ? this.apiConfig.environment : "local",
                "client.javascript.source_map_enabled": true,
                "client.javascript.code_version": "{BUILD_VERSION}" 
            };
            window._rollbarEnvironment = 'live';
            RollbarManager.initRollbar(window._rollbarParams, $, window, document);
        },

        _setupGoogleAnalytics: function()
        {

            if(!window.ga && this.apiConfig.gaAccount)
            {
                // This is Google code, don't let jshint complain about it.
                /* jshint ignore:start */
                (function (i, s, o, g, r, a, m)
                {
                    i['GoogleAnalyticsObject'] = r; i[r] = i[r] || function ()
                    {
                        (i[r].q = i[r].q || []).push(arguments)
                    }, i[r].l = 1 * new Date(); a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m)
                })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

                ga("create", this.apiConfig.gaAccount);
                ga("send", "pageview");
                /* jshint ignore:end */
            }

        },

        _setupMarsApp: function()
        {
            var $body = $("body");
            
            window.theMarsApp = {
                
                user: new UserModel(),
                
                getBodyElement: function()
                {
                    return $body;
                },

                featureAuthorizer: new LightweightFeatureAuthorizer({userType: this.userType, appRoot: this.apiConfig.appRoot}),

                assetsRoot: this.apiConfig.assetsRoot,

                apiConfig: this.apiConfig

            };
        },

        _appendExpandoPod: function(view, classnames)
        {
            var $pod = $("<div class='expandoPod'></div>");
            $pod.addClass(classnames);
            view.render().$el.addClass("expandoPodContent").appendTo($pod);
            this.$(".expandoPackeryRegion").append($pod);
        },

        _watchForWindowResize: function()
        {
            // window resize, and ui resize, trigger too many events
            $(window).on("resize.workoutQuickView", _.bind(_.debounce(this._onWindowResize, 500), this));

            this.on("close", this._stopWatchingWindowResize, this);
        },

        _stopWatchingWindowResize: function()
        {
            $(window).off("resize.workoutQuickView");
        },

        _onWindowResize: function()
        {
            _.each(this.subviews, function(subview)
            {
                subview.trigger("pod:resize");
            });
        },

        _loadExternalScripts: function()
        {
            var scripts = [
                "//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js",
                "//maps.google.com/maps/api/js?v=3.2&sensor=false&callback=Object" // without some callback= parameter, loading this script inline won't work
            ];

            _.each(scripts, function(script)
            {
                $("<script>").attr("src", script).appendTo("head");
            });     

        },

        _loadExternalStylesheets: function()
        {
            var stylesheets = [
                "//code.jquery.com/ui/1.10.0/themes/base/jquery-ui.css",
                this.apiConfig.appRoot + "/vendor/leaflet/leaflet.css",
                this.apiConfig.cssRoot + "/app/css/webfonts.css"
            ];

            _.each(stylesheets, function(stylesheet)
            {
                $("<link>").attr("rel", "stylesheet").attr("href", stylesheet).insertBefore("link:first");
            });
        },

        _isMobile: function()
        {
            return $(window).innerWidth() < 1100 || $(window).innerHeight() < 800;
        }

    });

    return PublicFileViewer;
});

