define(
[
    "TP",
    "hbs!templates/views/deleteConfirmationView"
],
function (TP, deleteConfirmationView)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: false,
            shadow: true
        },

        showThrobbers: false,
        tagName: "div",
        className: "deleteConfirmation",

        events:
        {
            "click #deleteConfirmationDelete": "onDeleteConfirmed",
            "click #deleteConfirmationCancel" : "onDeleteCancelled"
        },

        template:
        {
            type: "handlebars",
            template: deleteConfirmationView
        },

        onDeleteConfirmed: function()
        {
            this.trigger("deleteConfirmed");
            this.close();
        },
        
        onDeleteCancelled: function()
        {
            this.trigger("deleteCancelled");
            this.close();
        }
    });
});