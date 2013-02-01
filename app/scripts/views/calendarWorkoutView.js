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

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a CalendarWorkoutView without a model";

            // extend events here so we inherit the TP.ItemView defaults
            _.extend(this.modelEvents, { "change": "render" });
        }

    });
});