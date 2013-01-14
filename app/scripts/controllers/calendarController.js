define(
[
    "backbone",
    "backbone.marionette",
    "views/calendarView",
    "models/workouts"
],
function(Backbone, Marionette, CalendarView, Workouts)
{
    return Marionette.Controller.extend(
    {
        views: {},
        
        initialize: function()
        {
            _.bindAll(this);

            this.views.calendar = new CalendarView();

            var workouts = new Workouts({ startDate: new Date(2012, 5, 1), endDate: new Date(2012, 6, 1) });
            var waiting = workouts.fetch();
            var that = this;
            waiting.done(function()
            {
                that.views.calendar.injectWorkouts(workouts);
            });
        },
        
        display: function()
        {
            return this.views.calendar.render();
        }
    });
});