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

        template: _.template("<div class='expandoPodContent'></div>"),

        className: "expandoPod",

        initialize: function(options)
        {
            this.childView = options.childView;
            this.on("controller:resize", _.bind(this.childView.trigger, this.childView, "controller:resize"));
        },

        onRender: function()
        {
            var self = this;
            var $child = this.$(".expandoPodContent");
            this.childView.setElement($child);
            $child.addClass(this.childView.className);

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
