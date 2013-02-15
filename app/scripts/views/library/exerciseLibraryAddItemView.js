define(
[
    "TP",
    "jqueryui/dialog",
    "hbs!templates/views/library/exerciseLibraryAddItemView"

],
function(TP, dialog, exerciseLibraryAddItemView)
{
    "use strict";

    return TP.ItemView.extend(
    {

        attributes:
        {
            id: "exerciseLibraryAddItemView"
        },

        template:
        {
            type: "handlebars",
            template: exerciseLibraryAddItemView
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