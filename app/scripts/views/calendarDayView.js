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
        }
    });
});