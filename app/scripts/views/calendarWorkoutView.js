define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "hbs!templates/views/calendarWorkout"
],
function(Marionette, MaironetteHandlebars, CalendarWorkoutTemplate)
{
    return Marionette.ItemView.extend(
    {
        tagName: "div",
        className: "workout",
        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },
        modelEvents:
        {
            "change": "render"
        }
    });
});