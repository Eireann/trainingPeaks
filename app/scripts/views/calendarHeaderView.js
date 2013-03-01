define(
[
    "TP",
    "hbs!templates/views/calendarHeader"
],
function(TP, calendarHeaderTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: calendarHeaderTemplate
        },

        initialize: function()
        {
            if (!this.model)
                throw "Cannot have a CalendarHeaderView without a model";
        },

        onRender: function()
        {
        }
    });
});