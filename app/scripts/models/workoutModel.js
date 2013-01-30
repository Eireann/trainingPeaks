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
            var originalDate = this.get("WorkoutDay");
            var workoutDate = moment(originalDate);
            workoutDate.add("days", newDate.diff(workoutDate, "days"));

            var theWorkout = this;
            this.set("WorkoutDay", workoutDate.format(this.dateFormat));

            // on fail, return to old date
            return this.save().fail(function()
            {
                theWorkout.set("WorkoutDay", originalDate);
            });
            
        }

    });
});