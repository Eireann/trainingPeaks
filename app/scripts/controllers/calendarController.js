define(
[
    "backbone",
    "backbone.marionette",
    "moment",
<<<<<<< HEAD

=======
    
    "layouts/calendarLayout",
>>>>>>> e8ce1ff8cd92b00f061c203941b70724ab126b89
    "models/calendarDay",
    "views/calendarView",
    "models/workoutsCollection"
],
<<<<<<< HEAD
function (Backbone, Marionette, moment, CalendarDayModel, CalendarView, WorkoutsCollection)
=======
function(Backbone, Marionette, moment, CalendarLayout, CalendarDayModel, CalendarView, WorkoutsCollection)
>>>>>>> e8ce1ff8cd92b00f061c203941b70724ab126b89
{
    return Marionette.Controller.extend(
    {
        layout: new CalendarLayout(),
        
        views: {},
        daysCollection: null,
        daysHash: {},
<<<<<<< HEAD

        initialize: function ()
=======
        
        show: function()
        {
            this.layout.mainRegion.show(this.views.calendar);
        },
        
        initialize: function()
>>>>>>> e8ce1ff8cd92b00f061c203941b70724ab126b89
        {
            _.bindAll(this);

            this.startDate = moment().subtract("days", 40);
            this.endDate = moment().add("days", 30);
<<<<<<< HEAD
            console.log(this.startDate.format());
            console.log(this.endDate.format());
            this.initializeCalendarView();
            this.requestWorkouts(this.startDate, this.endDate);
        },

        initializeCalendarView: function ()
=======
           
            this.initializeCalendar();
            this.requestWorkouts(this.startDate, this.endDate);
        },
        
        initializeCalendar: function ()
>>>>>>> e8ce1ff8cd92b00f061c203941b70724ab126b89
        {
            this.daysCollection = this.createCollectionOfDays(moment(this.startDate), moment(this.endDate));

            this.views.calendar = new CalendarView({ collection: this.daysCollection });

            this.views.calendar.bind("prepend", this.prependWeekToCalendar);
            this.views.calendar.bind("append", this.appendWeekToCalendar);
        },

        createCollectionOfDays: function (startDate, endDate)
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

        requestWorkouts: function (startDate, endDate)
        {
            var workouts = new WorkoutsCollection({ startDate: startDate, endDate: endDate });

            var waiting = workouts.fetch();
            var that = this;

            waiting.done(function ()
            {
                workouts.each(function (workout)
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

        appendWeekToCalendar: function ()
        {
            var startDate = moment(this.endDate).add("days", 1);
            var endDate = moment(this.endDate).add("days", 7);
            this.endDate = moment(endDate);

            this.requestWorkouts(startDate, endDate);
            var newDays = this.createCollectionOfDays(startDate, endDate);

            // index option tells view whether we're appending or prepending
            this.daysCollection.add(newDays.models, { index: this.daysCollection.length });
        },

        prependWeekToCalendar: function ()
        {
            var endDate = moment(this.startDate).subtract("days", 1);
            var startDate = moment(this.startDate).subtract("days", 7);
            this.startDate = moment(startDate);

            this.requestWorkouts(startDate, endDate);

            // @TODO: the api endpoint returns a date range that includes startDate, but not endDate
            // so for now just adjusting here to ask for one day later
            var newDays = this.createCollectionOfDays(startDate, moment(endDate).add("days",1));

            // unshift doesn't accept a collection, but add does, using the 'at' option for index
            this.daysCollection.add(newDays.models, { index: 0, at: 0 });
        }
    });
});