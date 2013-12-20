define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!shared/templates/errorMessageTemplate"
],
function ($, _, TP, errorMessageTemplate)
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
            "click #userCancel" : "onCancelled",
            "click button[data-action]": "onButtonAction"
        },

        initialize: function(options)
        {
            if(options.hasOwnProperty("template"))
            {
                this.template = _.defaults({ template: options.template }, this.template);
            }
            this.options = options;
        },

        serializeData: function()
        {
            var data = { message: this.options.message };

            if(this.model)
            {
                _.extend(data, this.model.toJSON());
            }

            return data;
        },

        template:
        {
            template: errorMessageTemplate,
            type: "handlebars"
        },

        onConfirmed: function()
        {
            this.trigger("userConfirmed", this.options);
            this.close();
        },
        
        onCancelled: function()
        {
            this.trigger("userCancelled", this.options);
            this.close();
        },

        onButtonAction: function(e)
        {
            var action = $(e.currentTarget).data("action");
            this.trigger(action, this.options);
            this.close();
        }
    });
});
