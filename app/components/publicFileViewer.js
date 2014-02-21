define(
[
    "underscore",
    "jquery",
    "backbone.marionette.handlebars",
    "shared/models/userModel",
    "models/workoutModel",
    "models/workoutDetails",
    "views/workout/workoutBarView"
],
function(_,
         $,
         bmhbs,
         UserModel, 
         WorkoutModel,
         WorkoutDetails,
         WorkoutBarView)
{

    var PublicFileViewer = function(options)
    {
        this.token = "H5RXMLFQDGFSJJF3VWEM57YVUU";
        this.urlRoot = "https://tpapi.local.trainingpeaks.com/public/v1/workouts/";
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
            /*
                UserName = athlete.FirstName + " " + athlete.LastName,
                ProfileImageUrl = athlete.PhotoFileData != null ? athlete.PhotoFileData.GetUrl() : null,
                Units = athlete.UnitsValue,
                Workout = workout.ToAPIWorkout(),
                WorkoutDetailData = builder.Build()
            
            */

            this.userModel = new UserModel(data);

            window.theMarsApp = {
                user: this.userModel
            };

            this.workout = new WorkoutModel(data.workout);
            this.workout.get("detailData").set(data.workoutDetailData);

            var workoutBarView = new WorkoutBarView({ model: this.workout });

            this.$el.append(workoutBarView.render().$el);
        }
    });

    return PublicFileViewer;
});

