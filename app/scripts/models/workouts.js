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
                throw new Exception("startDate & endDate needed for WorkoutsCollection");
            
            var start = this.startDate.toJSON();
            var end = this.endDate.toJSON();

            start = start.substr(0, start.indexOf("T"));
            end = end.substr(0, end.indexOf("T"));
            
            //return "http://localhost:8900/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
            return "http://apideploy.trainingpeaks.com/WebApiServer/Fitness/V1/workouts/" + start + "/" + end;
        },
        initialize: function(options)
        {
            this.startDate = options.startDate;
            this.endDate = options.endDate;
        }
    });
});