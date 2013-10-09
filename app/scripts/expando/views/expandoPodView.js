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

        template: _.template("<div class='expandoPodContent'></div>"),

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
        },

        onShow: function()
        {
            this.childView.triggerMethod("show");
        },

        onClose: function()
        {
            this.childView.close();
        }

    });

    return ExpandoPodView;

});
