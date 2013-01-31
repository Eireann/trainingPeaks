﻿define(
[
    "underscore",
    "moment",
    "TP",
    "models/workoutsCollection"
],
function(_, moment, TP, WorkoutsCollection)
{
    return TP.Model.extend(
    {

        idAttribute: 'dateString',
        dateFormat: "YYYY-MM-DD",
        workouts: null,

        initialize: function()
        {
            _.bindAll(this);

            // we need a date
            var date = this.get("date");
            if(!date) {
                throw "CalendarDay requires a date";
            }

            // date must be a moment
            if (!moment.isMoment(date))
            {
                date = moment(date);
                this.set("date", date, { silent: true });
            }

            // formatted date for id in collection 
            this.set("dateString", moment(date).format(this.dateFormat), { silent: true });

            // empty collection to store our workouts
            this.workouts = new WorkoutsCollection();
        },

        addWorkout: function(workout)
        {
            this.workouts.add(workout);
            this.trigger("change");
        },

        removeWorkout: function(workout)
        {
            this.workouts.remove(workout);
            this.trigger("change");
        },

        getWorkouts: function()
        {
            return this.workouts;
        }
    });
});