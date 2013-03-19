define(
[
    "TP",
    "hbs!templates/views/library/exerciseLibraryAddItemView"

],
function(TP, exerciseLibraryAddItemView)
{
    "use strict";

    return TP.ItemView.extend(
    {

        modal: true,

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

        closeDialog: function ()
        {
            this.close();
        }

    });
});