define(
[
    "TP",
    "hbs!templates/views/calendar/library/exerciseLibraryAddItemView"

],
function(TP, exerciseLibraryAddItemView)
{

    return TP.ItemView.extend(
    {

        modal: {
            mask: true,
            shadow: true
        },

        tagName: "div",
        className: "exerciseLibraryAddItemView",

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