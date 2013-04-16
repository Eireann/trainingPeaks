define(
[
    "moment",
    "TP",
    "views/calendar/workout/calendarWorkoutView",
    "hbs!templates/views/calendar/workout/calendarWorkoutDragState"
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