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

        showThrobbers: false,
        tagName: "div",
        className: "deleteConfirmation",

        events:
        {
            "click #userOK" : "onOKClicked"
        },

        initialize: function(options)
        {
            this.template.template = options.template;
        },

        template:
        {
            type: "handlebars"
        },
        
        onOKClicked: function()
        {
            this.close();
        }
    });
});
