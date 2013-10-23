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
                "data-rows": this.model.get("rows") || 1,
                "data-cols": this.model.get("cols") || 1
            };
        },

        template:
        {
            type: "handlebars",
            template: expandoPodTemplate
        },

        initialize: function(options)
        {
            this.childView = options.childView;
            this.on("controller:resize", _.bind(this.childView.trigger, this.childView, "controller:resize"));
            this.listenTo(this.childView, "close", _.bind(this.close, this));
            this.listenTo(this.childView, "item:rendered", _.bind(this._onChildRender, this));
            this.listenTo(this.childView, "noData", _.bind(this._onChildHasNoData, this));
            this.listenTo(this.childView, "hasData", _.bind(this._onChildHasData, this));
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
        },

        _onChildRender: function()
        {
            if(this.childView.$el.hasClass("noData"))
            {
                this._onChildHasNoData(); 
            }
            else
            {
                this._onChildHasData();
            }
        },

        _onChildHasData: function()
        {
            this.$el.removeClass("noData");
        },

        _onChildHasNoData: function()
        {
            this.$el.addClass("noData");
        }


    });

    return ExpandoPodView;

});
