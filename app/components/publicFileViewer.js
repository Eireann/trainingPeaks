define(
[
    "underscore",
    "jquery",
    "backbone.marionette.handlebars",
    "flot/jquery.flot",
    "shared/models/userModel",
    "models/workoutModel",
    "expando/models/expandoStateModel",
    "views/workout/workoutBarView",
    "views/expando/graphView"
],
function(_,
         $,
         bmhbs,
         Flot,
         UserModel, 
         WorkoutModel,
         ExpandoStateModel,
         WorkoutBarView,
         GraphView)
{

    var PublicFileViewer = function(options)
    {
        this.token = "H5RXMLFQDGFSJJF3VWEM57YVUU";
        this.urlRoot = "https://tpapi.dev.trainingpeaks.com/public/v1/workouts/";
        this.$el = options.$el;
    };

    _.extend(PublicFileViewer.prototype, {

        load: function()
        {
            var ajaxOptions = {
                url: this.urlRoot + this.token,
                type: "GET",
                contentType: "application/json",
            };
            $.ajax(ajaxOptions).done(_.bind(this.render, this));
        },

        render: function(data)
        {
            var userModel = new UserModel(data);

            window.theMarsApp = {
                user: userModel
            };

            var workout = new WorkoutModel(data.workout);
            workout.get("detailData").set(data.workoutDetailData);
            workout.get("detailData").reset();

            var workoutBarView = new WorkoutBarView({ model: workout });

            this.$el.find(".workoutBarView").append(workoutBarView.render().$el);

            var expandoStateModel = new ExpandoStateModel();

            var graphView = new GraphView(
            {
                model: workout,
                detailDataPromise: new $.Deferred().resolve(),
                stateModel: expandoStateModel
            });

            this.$el.find(".expandoPackeryRegion").append(graphView.render().$el);
        }
    });

    return PublicFileViewer;
});

