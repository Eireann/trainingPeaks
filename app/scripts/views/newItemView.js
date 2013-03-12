define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/newItemView"
],
function (TP, dialog, newItemViewTemplate)
{
    return TP.ItemView.extend(
    {
        events:
        {
        },

        template:
        {
            type: "handlebars",
            template: newItemViewTemplate
        },

        onBeforeRender: function ()
        {
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                width: 800,
                height: 600,
                resizable: false
            });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
        }
    });
});