define(
[
    "TP",
    "hbs!templates/views/deleteConfirmationView"
],
function (TP, deleteConfirmationView)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",

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

        onRender: function ()
        {
            $('body').append(this.$el);
            this.$el.dialog({
                modal: true
            });
        },
        
        onDeleteConfirmed: function()
        {
            this.trigger("deleteConfirmed");
            this.close();
        },
        
        onDeleteCancelled: function()
        {
            this.close();
        },
    });
});