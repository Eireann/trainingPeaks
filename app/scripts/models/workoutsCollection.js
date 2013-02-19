define(
[
    "moment",
    "TP",
    "models/workoutModel"
],
function(moment, TP, WorkoutModel)
{
    return TP.Collection.extend(
    {
        model: WorkoutModel,

        urlRoot: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        },

        url: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for WorkoutsCollection";

            var start = this.startDate.format("YYYY-MM-DD");
            var end = moment(this.endDate).format("YYYY-MM-DD");

            return this.urlRoot() + "/" + start + "/" + end;
        },

        initialize: function(models, options)
        {
            if (options)
            {
                this.startDate = options.startDate;
                this.endDate = options.endDate;
            }
        }
    });
});