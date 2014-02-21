define(
[
    "underscore",
    "jquery",
    "backbone.marionette.handlebars",
    "flot/jquery.flot",
    "TP",
    "shared/models/userModel",
    "models/workoutModel",
    "expando/models/expandoStateModel",
    "views/workout/workoutBarView",
    "views/expando/graphView",
    "views/expando/mapView",
    "hbs!publicFileViewer/publicFileViewerTemplate"
],
function(_,
         $,
         bmhbs,
         Flot,
         TP,
         UserModel, 
         WorkoutModel,
         ExpandoStateModel,
         WorkoutBarView,
         GraphView,
         MapView,
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
            this.urlRoot = "https://tpapi.dev.trainingpeaks.com/public/v1/workouts/";
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

            window.theMarsApp = {
                user: this.userModel
            };

            this.workout = new WorkoutModel(data.workout);
            this.workout.get("detailData").set(data.workoutDetailData);
            this.workout.get("detailData").reset();
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
            this.appendExpandoPod(mapView);
        },

        appendExpandoPod: function(view)
        {
            var $pod = $("<div class='expandoPod'></div>");
            view.render().$el.addClass("expandoPodContent").appendTo($pod);
            this.$(".expandoPackeryRegion").append($pod);
        }

    });

    return PublicFileViewer;
});

