define(
[
    "backbone",
    "models/workoutModel"
],
function(Backbone, WorkoutModel)
{
    return Backbone.Collection.extend(
    {
        model: WorkoutModel,
        url: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for WorkoutsCollection";

            var start = this.startDate.format("YYYY-MM-DD");
            var end = this.endDate.format("YYYY-MM-DD");

            //return "http://localhost:8900/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
            //return "http://apideploy.trainingpeaks.com/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
            return "http://apidev.trainingpeaks.com/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
        },
        initialize: function(options)
        {
            this.startDate = options.startDate;
            this.endDate = options.endDate;
        }
    });
});