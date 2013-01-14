define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "models/calendarDay",
    "hbs!templates/views/calendarDay"
],
function(Marionette, MaironetteHandlebars, CalendarDayModel, CalendarDayTemplate)
{
    return Marionette.ItemView.extend(
    {
        model: CalendarDayModel,
        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        }
    });
});