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
    "shared/models/userModel",
    "models/workoutModel",
    "models/workoutStatsForRange",
    "expando/models/expandoStateModel",
    "./dateAndTimeView",
    "views/workout/workoutBarView",
    "./userProfileView",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "shared/views/userUpgradeView",
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
         UserModel, 
         WorkoutModel,
         WorkoutStatsForRangeModel,
         ExpandoStateModel,
         DateAndTimeView,
         WorkoutBarView,
         UserProfileView,
         GraphView,
         MapView,
         StatsView,
         LapsView,
         UserUpgradeView,
         EmailCaptureView,
         publicFileViewerTemplate
         )
{

    /*
    var WorkoutBarViewWithoutCompliance = WorkoutBarView.extend({
        getComplianceCssClassName: function ()
        {
            return "ComplianceNone";
        }
    });
    */

    var LightweightFeatureAuthorizer = function(options){
        this.userType = options.userType;
    };

    _.extend(LightweightFeatureAuthorizer.prototype, {

        userIsPremium: function()
        {
            return _.contains([1,2,4,5], this.userType);
        },

        features: {
            ViewGraphRanges: function(){ return this.userIsPremium(); },
            ExpandoDataEditing: function(){ return this.userIsPremium(); },
            EditLapNames: false
        },

        canAccessFeature: function(featureChecker, attributes, options){
            if(_.isFunction(featureChecker))
            {
                return featureChecker.call(this, this.userType, attributes, options);
            }
            else
            {
                return !!featureChecker; 
            }
        },

        runCallbackOrShowUpgradeMessage: function(featureChecker, callback, attributes, options)
        {
            if(this.canAccessFeature(featureChecker, attributes, options))
            {
                callback();
            }
            else
            {
                this.showUpgradeMessage(_.extend({ }, featureChecker.options, options));
            }
        },

        showUpgradeMessage: function(options)
        {
            options = options || {};

            _.defaults(options, { userType: this.userType, imageRoot: theMarsApp.apiConfig.appRoot + "/" });

            if(!this.upgradeView || this.upgradeView.isClosed)
            {
                this.upgradeView = new UserUpgradeView(options);
                this.upgradeView.render();

                if(options.onClose) this.upgradeView.once("close", options.onClose);
            }
        }

    });

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
                    cssClass: "expandoMapPod"
                },
                {
                    podView: GraphView,
                    cssClass: ""
                }
            ];

            _.each(pods, function(pod)
            {
                var view = new pod.podView(options);
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
            var env = "local";
            var hostNameMatch = document.location.hostname.match(/([a-z]+)\.trainingpeaks\.com/);
            var port = document.location.port ? ":" + document.location.port : "";

            if(hostNameMatch && hostNameMatch.length === 2)
            {
                env = hostNameMatch[1];
            }

            this.apiConfig = _.defaults({}, window.apiConfig, {
                wwwRoot: "//www." + (env === "local" ? "dev" : env) + ".trainingpeaks.com",
                appRoot: "//app." + env + ".trainingpeaks.com" + port,
                cmsRoot: "//home." + env + ".trainingpeaks.com" + port,
                apiRoot: "//tpapi." + (env === "local" ? "dev" : env) + ".trainingpeaks.com",
                coachUpgradeURL: "//home.trainingpeaks.com/account-professional-edition.aspx",
                upgradeURL: "//home.trainingpeaks.com/account-manager/athlete-upgrade"
            });
        
            if(!this.apiConfig.assetsRoot)
            {
                this.apiConfig.assetsRoot = this.apiConfig.appRoot + "/assets/";
            }

            if(!this.apiConfig.cssRoot)
            {
                this.apiConfig.cssRoot = this.apiConfig.appRoot + ( this.apiConfig.appRoot.indexOf("local") >= 0 ? "/build/debug" : "");
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

                featureAuthorizer: new LightweightFeatureAuthorizer({userType: this.userType}),

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


    });

    return PublicFileViewer;
});

