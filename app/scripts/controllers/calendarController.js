define(
[
    "backbone",
    "backbone.marionette",
    "views/calendarView",
    "models/workouts",
    
    "moment"
    // "jquery.mousewheel"
],
function(Backbone, Marionette, CalendarView, Workouts, moment)
{
    return Marionette.Controller.extend(
    {
        views: {},
        
        initialize: function()
        {
            _.bindAll(this);
            
            this.startDate = moment().subtract("days", 15);
            this.endDate = moment().add("days", 16);

            this.views.calendar = new CalendarView({ startDate: this.startDate, endDate: this.endDate });
            this.views.calendar.bind("request:data", this.requestCalendarDays);

            var workouts = new Workouts({ startDate: this.startDate, endDate: this.endDate });
            var waiting = workouts.fetch();
            var that = this;
            
            waiting.done(function()
            {
                that.views.calendar.injectWorkouts(workouts);
            });
            
            /*
             * This is an option to intercept the mousewheel event on any DOM element.
             * It allows us to scroll without a scrollable div (overflow: hidden)
             * 
            $(this.views.calendar.el).mousewheel(function (event, delta, deltaX, deltaY)
            {
                
            });
            */
        },
        
        requestCalendarDays: function()
        {
            
        },
        
        display: function()
        {
            return this.views.calendar;
        }
    });
});