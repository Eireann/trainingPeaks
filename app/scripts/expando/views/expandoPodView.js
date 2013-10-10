define(
[
    "underscore",
    "TP",
    "hbs!expando/templates/expandoPodTemplate"
],
function(
    _,
    TP,
    expandoPodTemplate
)
{

    var ExpandoPodView = TP.ItemView.extend(
    {

        className: "expandoPod",

        attributes: function()
        {
            return {
                "data-rows": this.model.get("rows") || 3,
                "data-cols": this.model.get("cols") || 3
            };
        },

        template:
        {
            type: "handlebars",
            template: expandoPodTemplate
        },

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
