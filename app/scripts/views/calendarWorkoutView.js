define(
[
    "TP",
    "hbs!templates/views/calendarWorkout"
],
function(TP, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
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