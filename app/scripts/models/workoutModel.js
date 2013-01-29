define(
[
    "moment",
    "TP",
    "app"
],
function(moment, TP, theApp)
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
        },

        moveToDay: function(newDate)
        {
            var newDay = moment(newDate);
            var workoutDate = moment(this.get("WorkoutDay"));
            workoutDate.year(newDay.year());
            workoutDate.month(newDay.month());
            workoutDate.date(newDay.date());
            this.set("WorkoutDay", workoutDate.format("YYYY-MM-DDThh:mm:ss"));
            var onSave = this.save();
            onSave.done(function() { alert('saved'); });
        }

    });
});