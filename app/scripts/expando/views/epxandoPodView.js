define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var ExpandoPodView = TP.ItemView.extend(
    {

        className: "expandoPod",

        initialize: function(options)
        {
            this.childView = options.childView;
        },

        onRender: function()
        {
            var self = this;
            this.childView.setElement(this.$(".expandoPodContent"));
            this.childView.render();
        }

    });

    return ExpandoPodView;

});
