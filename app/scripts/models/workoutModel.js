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
        shortDateFormat: "YYYY-MM-DD",
        dateFormat: "YYYY-MM-DDThh:mm:ss",

        url: function()
        {
            return theApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        },

        getCalendarDate: function()
        {
            return moment(this.get("WorkoutDay")).format(this.shortDateFormat);
        },

        moveToDay: function(newDate)
        {
            newDate = moment(newDate);
            var workoutDate = moment(this.get("WorkoutDay"));
            workoutDate.add("days", newDate.diff(workoutDate, "days"));
            this.set("WorkoutDay", workoutDate.format(this.dateFormat));
            this.save();
        }

    });
});