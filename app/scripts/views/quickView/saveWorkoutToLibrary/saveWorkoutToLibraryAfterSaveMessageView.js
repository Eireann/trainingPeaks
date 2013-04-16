define(
[
    "TP",
    "hbs!templates/views/saveWorkoutToLibraryAfterSaveMessage"
],
function (TP, afterSaveMessageTemplate)
{
    return TP.ItemView.extend(
    {
        modal: {
            mask: true,
            shadow: true
        },

        showThrobbers: false,
        tagName: "div",
        className: "afterSaveMessage",

        events:
        {
            "click #ok": "onOk"
        },

        template:
        {
            type: "handlebars",
            template: afterSaveMessageTemplate
        },

        onOk: function()
        {
            this.close();
        }

    });
});