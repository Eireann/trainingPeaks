define(
[
    "TP",
    "hbs!templates/views/expando/statsTemplate"
],
function (TP, statsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: statsTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        }
    });
});