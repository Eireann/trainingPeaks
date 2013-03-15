define(
[
    "TP",
    "hbs!templates/views/shiftWizzard"
],
function (TP, shiftWizzard)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",

        events:
        {

        },

        template:
        {
            type: "handlebars",
            template: shiftWizzard
        },

        onRender: function ()
        {
            $('body').append(this.$el);
            this.$el.dialog({
                modal: true
            });
        }
    });
});