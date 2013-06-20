define(
[
    "TP"
],
function (TP)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "deleteConfirmation",

        events:
        {
            "click #userConfirm": "onConfirmed",
            "click #userCancel" : "onCancelled"
        },

        initialize: function(options)
        {
            this.template.template = options.template;
        },

        template:
        {
            type: "handlebars"
        },

        onConfirmed: function()
        {
            this.trigger("userConfirmed");
            this.close();
        },
        
        onCancelled: function()
        {
            this.trigger("userCancelled");
            this.close();
        }
    });
});