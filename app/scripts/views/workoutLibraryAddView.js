define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/workoutLibraryAddView"

],
function(TP, dialog, workoutLibraryAddView)
{
    "use strict";

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: workoutLibraryAddView
        },

        onBeforeRender: function ()
        {
            this.$el.dialog(
            {
                autoOpen: false,
                modal: true
            });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
        }

    });
});