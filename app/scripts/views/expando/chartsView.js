define(
[
    "TP",
    "hbs!templates/views/expando/chartsTemplate"
],
function(TP, chartsTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: chartsTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        }
    });
});