define(
[
    "TP",
    "hbs!templates/views/dayBarView"
],
function (TP, dayBarViewTemplate)
{

    var today = moment().format(TP.utils.datetime.shortDateFormat);

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
            if (this.model.id === today)
            {
                this.$el.addClass("today");
            }
        }
    });
});