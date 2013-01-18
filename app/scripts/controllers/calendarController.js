define(
[
    "backbone",
    "backbone.marionette",
    "moment",
    
    "models/calendarDay",
    "views/calendarView",
    "models/workoutsCollection"
],
function(Backbone, Marionette, moment, CalendarDayModel, CalendarView, WorkoutsCollection)
{
    return Marionette.Controller.extend(
    {
        views: {},
        daysCollection: null,
        daysHash: {},
        
        initialize: function()
        {
            _.bindAll(this);
            
            this.startDate = moment().subtract("days", 40);
            this.endDate = moment().add("days", 30);
           
            this.initializeCalendarView();
            this.requestWorkouts(this.startDate, this.endDate);
        },
        
        initializeCalendarView: function ()
        {
            this.daysCollection = this.createCollectionOfDays(moment(this.startDate), moment(this.endDate));
            
            this.views.calendar = new CalendarView({ collection: this.daysCollection });
            
            this.views.calendar.bind("prepend", this.prependWeekToCalendar);
            this.views.calendar.bind("append", this.appendWeekToCalendar);
        },
        
        createCollectionOfDays: function(startDate, endDate)
        {
            var numOfDaysToShow = endDate.diff(startDate, "days");

            var daysCollection = new Backbone.Collection();

            for (var dayOffset = 0; dayOffset < numOfDaysToShow; ++dayOffset)
            {
                var day = new CalendarDayModel({ date: moment(startDate) });
                this.daysHash[startDate.format("YYYY-MM-DD")] = day;
                daysCollection.add(day);
                startDate.add("days", 1);
            }
            
            return daysCollection;
        },
        
        requestWorkouts: function(startDate, endDate)
        {
            var workouts = new WorkoutsCollection({ startDate: startDate, endDate: endDate });
            
            var waiting = workouts.fetch();
            var that = this;

            waiting.done(function ()
            {
                workouts.each(function(workout)
                {
                    var workoutDay = workout.get("WorkoutDay");
                    if (workoutDay)
                    {
                        workoutDay = workoutDay.substr(0, workoutDay.indexOf("T"));
                        if (that.daysHash[workoutDay])
                        {
                            that.daysHash[workoutDay].set("workoutId", workout.get("WorkoutId"));
                            that.daysHash[workoutDay].set("workoutDay", workout.get("WorkoutDay"));
                        }
                    }
                });
            });
        },
        
        appendWeekToCalendar: function()
        {
            var startDate = moment(this.endDate).add("days", 1);
            this.endDate = moment(startDate).add("days", 6);

            this.requestWorkouts(startDate, moment(this.endDate));

            var newDays = this.createCollectionOfDays(startDate, moment(this.endDate));
            this.daysCollection.add(newDays.models);
        },
        
        prependWeekToCalendar: function ()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            this.startDate = moment(this.startDate).subtract("days", 6);

            this.requestWorkouts(this.startDate, moment(endDate));

            var newDays = this.createCollectionOfDays(this.startDate, moment(endDate));
            this.daysCollection.unshift(newDays.models);
        },
        
        display: function()
        {
            return this.views.calendar;
        }
    });
});