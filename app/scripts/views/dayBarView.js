define(
[
    "moment",
    "TP",
    "hbs!templates/views/dayBarView"
],
function (moment, TP, dayBarViewTemplate)
{

    return TP.ItemView.extend(
    {
        className: "day",

        template:
        {
            type: "handlebars",
            template: dayBarViewTemplate
        },

        onRender: function()
        {
            if (TP.utils.datetime.isToday(this.model.id))
            {
                this.$el.addClass("today");
            }
        }
    });
});
