define(
[
    "backbone.marionette",
    "hbs!templates/views/calendarWorkout"
],
function(Marionette, CalendarWorkoutTemplate)
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