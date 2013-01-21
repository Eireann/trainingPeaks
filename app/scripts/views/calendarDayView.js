define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "views/calendarWorkoutView",
    "hbs!templates/views/calendarDay"
],
function(Marionette, MaironetteHandlebars, CalendarWorkoutView, CalendarDayTemplate)
{
    return Marionette.ItemView.extend(
    {
        tagName: "div",
        className: "day",
        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        },
        modelEvents:
        {
            "change": "render"
        },
        onRender: function()
        {
            var workout = this.model.get("workout");
            if (workout)
            {
                var workoutView = new CalendarWorkoutView({ model: workout });
                workoutView.render();
                this.$el.append(workoutView.el);
            };
        }

    });
});