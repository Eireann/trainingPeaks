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
        },

        initialize: function(options)
        {
            _.bindAll(this);
            if (!this.model)
            {
                throw "Cannot have a CalendarWorkoutView without a model";
            }
        }

    });
});