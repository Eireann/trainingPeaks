define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!shared/templates/waitMessageTemplate"
],
function ($, _, TP, waitMessageTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: false,
            onOverlayClick: function(){return false;}
        },

        closeOnResize: false,

        tagName: "div",
        className: "waitMessage",

        template:
        {
            template: waitMessageTemplate,
            type: "handlebars"
        },

        onRender: function()
        {
            //this.$overlay.hide().fadeIn();
            //this.$el.hide().fadeIn();
        }
    });
});
