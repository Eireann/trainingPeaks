define(
[
    "moment",
    "backbone",
    "models/workoutModel"
],
function(moment, Backbone, WorkoutModel)
{
    return Backbone.Collection.extend(
    {
        model: WorkoutModel,
        url: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for WorkoutsCollection";

            var start = this.startDate.format("YYYY-MM-DD");

            // add one day because the end date is not inclusive - is this intentional in the api, or a bug?
            var end = moment(this.endDate).add("days", 1).format("YYYY-MM-DD");

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