define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "hbs!templates/views/calendarDay"
],
function(Marionette, MaironetteHandlebars, CalendarDayTemplate)
{
    return Marionette.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        }
    });
});