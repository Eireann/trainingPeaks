define(
[
    "underscore",
    "jquery",
    "backbone.marionette.handlebars",
    "flot/jquery.flot",
    "TP",
    "shared/models/userModel",
    "models/workoutModel",
    "models/workoutStatsForRange",
    "expando/models/expandoStateModel",
    "views/workout/workoutBarView",
    "views/expando/graphView",
    "views/expando/mapView",
    "views/expando/statsView",
    "views/expando/lapsView",
    "hbs!publicFileViewer/publicFileViewerTemplate"
],
function(_,
         $,
         bmhbs,
         Flot,
         TP,
         UserModel, 
         WorkoutModel,
         WorkoutStatsForRangeModel,
         ExpandoStateModel,
         WorkoutBarView,
         GraphView,
         MapView,
         StatsView,
         LapsView,
         publicFileViewerTemplate
         )
{

    var PublicFileViewer = TP.ItemView.extend({

        showThrobbers: false,

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

            var apiConfig = _.defaults({}, window.apiConfig, {
                assetsRoot: "http://app.trainingpeaks.com/assets"
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
                        ViewGraphRanges: true
                    }
                },

                assetsRoot: apiConfig.assetsRoot

            };
        },

        onRender: function()
        {
            
            var workoutBarView = new WorkoutBarView({ model: this.workout });

            this.$(".workoutBarView").append(workoutBarView.render().$el);

            var expandoStateModel = new ExpandoStateModel();

            var podOptions = {
                model: this.workout,
                detailDataPromise: new $.Deferred().resolve(),
                stateModel: expandoStateModel
            };

            var graphView = new GraphView(podOptions);
            this.appendExpandoPod(graphView);

            var mapView = new MapView(podOptions);
            this.appendExpandoPod(mapView, "expandoMapPod");

            var statsView = new StatsView(podOptions);
            this.$(".expandoStatsRegion").append(statsView.render().$el); 

            var lapsView = new LapsView(podOptions);
            this.$(".expandoLapsRegion").append(lapsView.render().$el);
            lapsView.onShow();
        },

        appendExpandoPod: function(view, classnames)
        {
            var $pod = $("<div class='expandoPod'></div>");
            $pod.addClass(classnames);
            view.render().$el.addClass("expandoPodContent").appendTo($pod);
            this.$(".expandoPackeryRegion").append($pod);
        }

    });

    return PublicFileViewer;
});

