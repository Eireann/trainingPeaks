define(
[
    "moment",
    "TP",
    "hbs!templates/views/dayBarView"
],
function (moment, TP, dayBarViewTemplate)
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
