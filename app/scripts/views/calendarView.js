define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "models/calendarDay",
    "views/calendarDayView",
    "hbs!templates/views/calendar"
],
function(Marionette, MarionetteHandlebars, CalendarDayModel, CalendarDayView, CalendarTemplate)
{
    return Marionette.View.extend(
    {
        days:
        {
            
        },
        
        initialize: function(options)
        {
        },
        
        injectWorkouts: function(workouts)
        {
            for (var i = 0; i < workouts.length; ++i)
            {
                var date = workouts.at(i).get("WorkoutDay");
                date = date.substr(0, date.indexOf("T"));
                
                if (this.days[date])
                {
                    this.days[date].model.set("workout", workouts.at(i));
                }
            }
        },
        
        render: function()
        {
            var html = CalendarTemplate({});
            $(this.el).html(html);

            var i = 0;
            var today = new Date(2012, 5, 1);
            var that = this;
            
            this.$(".day").each(function()
            {
                var date = new Date(today.getTime() + (i++ * 24 * 60 * 60 * 1000));
                var dayModel = new CalendarDayModel({ date: date.toLocaleDateString() });
                var dayView = new CalendarDayView({ el: this, model: dayModel, collection: new Backbone.Collection() });

                var dayViewsHashKey = date.toJSON();
                dayViewsHashKey = dayViewsHashKey.substr(0, dayViewsHashKey.indexOf("T"));
                
                that.days[dayViewsHashKey] = dayView;

                dayView.render();
            });
            
            return this;
        }
    });
});