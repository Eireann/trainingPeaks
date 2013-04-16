define(
[
    "moment",
    "TP",
    "views/calendarWorkout/calendarWorkoutView",
    "hbs!templates/views/calendarWorkoutDragState"
],
function(moment, TP, CalendarWorkoutView, CalendarWorkoutTemplateDragState)
{
    return CalendarWorkoutView.extend(
    {

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplateDragState
        }
    });
});