define(
[
    "moment",
    "backbone",
    "app",
    "models/workoutModel"
],
function(moment, Backbone, theApp, WorkoutModel)
{
    return Backbone.Collection.extend(
    {
        model: WorkoutModel,
        url: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for WorkoutsCollection";

            var start = this.startDate.format("YYYY-MM-DD");
            var end = moment(this.endDate).format("YYYY-MM-DD");

            return theApp.apiRoot + "/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
        },
        initialize: function(options)
        {
            this.startDate = options.startDate;
            this.endDate = options.endDate;
        }
    });
});