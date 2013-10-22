﻿define(
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
            "click #userCancel" : "onCancelled",
            "click button[data-action]": "onButtonAction"
        },

        initialize: function(options)
        {
            this.template.template = options.template;
            this.options = options;
        },

        template:
        {
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