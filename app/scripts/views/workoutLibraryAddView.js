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

        attributes:
        {
            id: "workoutLibraryAddView"
        },

        template:
        {
            type: "handlebars",
            template: workoutLibraryAddView
        },

        events:
        {
            "click button#cancel": "closeDialog",
            "click button#save": "closeDialog"
        },

        onBeforeRender: function()
        {

            var self = this;

            this.$el.dialog(
            {
                autoOpen: false,
                modal: true,
                position: {
                    my: "left top",
                    at: "left bottom",
                    of: "#workoutLibrary button#add"
                },
                resizable: false,
                draggable: false
            });
        },

        onRender: function ()
        {
            this.$el.dialog("open");
        },

        closeDialog: function ()
        {
            this.$el.dialog("close");
            this.close();
        }

    });
});