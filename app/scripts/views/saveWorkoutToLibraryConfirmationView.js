define(
[
    "TP",
    "hbs!templates/views/saveWorkoutToLibraryConfirmationView"
],
function(TP, saveWorkoutToLibraryTemplate)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: true,
            shadow: true
        },

        showThrobbers: false,
        tagName: "div",
        className: "saveWorkoutToLibraryConfirmation",

        events:
        {
            "click #confirmationOk": "onOk",
            "click #confirmationCancel" : "onCancel"
        },

        template:
        {
            type: "handlebars",
            template: saveWorkoutToLibraryTemplate
        },

        onOk: function()
        {
            alert('fixme');
        },

        onCancel: function()
        {
            this.close();
        }

    });
});