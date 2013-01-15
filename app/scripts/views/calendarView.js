define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "hbs!templates/views/calendar",
    "hbs!templates/views/calendarDay"
],
function(Marionette, MarionetteHandlebars, CalendarTemplate, CalendarDayTemplate)
{
    return Marionette.View.extend(
    {
        initialize: function(options)
        {
        },
        
        injectWorkouts: function(workouts)
        {
            this.$(".day").each(function()
            {
                var i = 0;
                for (; i < workouts.length; ++i)
                {
                    console.log(workouts.at(i).get("WorkoutDay"));
                    if (workouts.at(i).get("WorkoutDay") === 123)
                        console.log("la");
                }

            });
        },
        
        render: function()
        {
            var html = CalendarTemplate({});
            $(this.el).html(html);

            var i = 0;
            var today = new Date();
            this.$(".day").each(function()
            {
                var date = new Date(today.getTime() + (i++ * 24 * 60 * 60 * 1000));
                $(this).html(CalendarDayTemplate({ date: date.toLocaleDateString() }));
            });

            return this;
        }
    });
});