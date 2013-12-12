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

            // no close on click
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
            this.$overlay.css({opacity: 0}).animate({opacity: 0.5}, 500);
            this.$el.css({opacity: 0}).animate({opacity: 1}, 500);
        },

        // keep it open until closed
        closeOnRouteChange: function()
        {
            return false;
        }
    });
});
