define(
[
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
    "./userNameView",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "hbs!publicFileViewer/publicFileViewerTemplate"
],
function(_,
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
         UserNameView,
         GraphView,
         MapView,
         StatsView,
         LapsView,
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
            var urlRoot = "https://tpapi.dev.trainingpeaks.com/public/v1/workouts/";
            this.urlRoot = urlRoot;
            WorkoutStatsForRangeModel.prototype.urlRoot = function()
            {
                return urlRoot + options.token + "/"; 
            };
        },

        load: function()
        {
            var ajaxOptions = {
                url: this.urlRoot + this.token,
                type: "GET",
                contentType: "application/json",
            };
            return $.ajax(ajaxOptions).done(_.bind(this.setupModels, this));
        },

        setupModels: function(data)
        {
            this.userModel = new UserModel(data);
            this.workout = new WorkoutModel(data.workout);
            this.workout.get("detailData").set(data.workoutDetailData);
            this.workout.get("detailData").reset();
            this.setupMarsApp();
        },

        setupMarsApp: function()
        {
            var $body = $("body");

            this.apiConfig = _.defaults({}, window.apiConfig, {
                assetsRoot: "http://app.dev.trainingpeaks.com/assets/",
                wwwRoot: "http://www.dev.trainingpeaks.com"
            });

            window.theMarsApp = {
                user: this.userModel,
                
                getBodyElement: function()
                {
                    return $body;
                },

                featureAuthorizer: {

                    canAccessFeature: function(featureValue){
                        return !!featureValue;
                    },

                    runCallbackOrShowUpgradeMessage: function(featureChecker, callback, attributes, options){
                        if(this.canAccessFeature(featureChecker))
                        {
                            callback(); 
                        }
                    },

                    features: {
                        ViewGraphRanges: true,
                        EditLapNames: false
                    }
                },

                assetsRoot: this.apiConfig.assetsRoot

            };
        },

        onRender: function()
        {

            var dateAndTimeView = new DateAndTimeView({ model: this.workout });
            this.$(".workoutBarView").before(dateAndTimeView.render().$el);
            this.subviews.push(dateAndTimeView); 

            var workoutBarView = new WorkoutBarView({ model: this.workout });
            this.$(".workoutBarView").append(workoutBarView.render().$el);
            this.subviews.push(workoutBarView);

            var userNameView = new UserNameView({ model: this.userModel, wwwRoot: this.apiConfig.wwwRoot });
            this.$(".QVHeader").append(userNameView.render().$el);
            this.subviews.push(userNameView);

            var expandoStateModel = new ExpandoStateModel();

            var podOptions = {
                model: this.workout,
                detailDataPromise: new $.Deferred().resolve(),
                stateModel: expandoStateModel
            };

            var graphView = new GraphView(podOptions);
            this.appendExpandoPod(graphView);
            this.subviews.push(graphView);

            var mapView = new MapView(podOptions);
            this.appendExpandoPod(mapView, "expandoMapPod");
            this.subviews.push(mapView);

            var statsView = new StatsView(podOptions);
            this.$(".expandoStatsRegion").append(statsView.render().$el); 
            this.subviews.push(statsView);

            var lapsView = new LapsView(podOptions);
            this.$(".expandoLapsRegion").append(lapsView.render().$el);
            lapsView.onShow();
            this.subviews.push(lapsView);

            this._watchForWindowResize();
        },

        appendExpandoPod: function(view, classnames)
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
        }

    });

    return PublicFileViewer;
});

