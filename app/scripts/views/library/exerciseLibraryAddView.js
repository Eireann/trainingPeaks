define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/library/exerciseLibraryAddView"

],
function(TP, dialog, exerciseLibraryAddView)
{
    "use strict";

    return TP.ItemView.extend(
    {

        attributes:
        {
            id: "exerciseLibraryAddView"
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryAddView
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
                    of: "#exerciseLibrary button#add"
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