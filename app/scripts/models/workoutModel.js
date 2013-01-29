define(
[
    "TP",
    "app"
],
function(TP, theApp)
{
    return TP.Model.extend(
    {

        idAttribute: "WorkoutId",

        url: function()
        {
            return theApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        },

        getCalendarDate: function()
        {
            var workoutDay = this.get("WorkoutDay");
            return workoutDay.substr(0, workoutDay.indexOf("T"));
        }

    });
});