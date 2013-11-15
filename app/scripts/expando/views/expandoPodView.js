define(
[
    "jquery",
    "underscore",
    "TP",
    "hbs!expando/templates/expandoPodTemplate"
],
function(
    $,
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
                "data-rows": this.model.get("heightInRows") || 1,
                "data-cols": this.model.get("widthInColumns") || 1
            };
        },

        template:
        {
            type: "handlebars",
            template: expandoPodTemplate
        },

        events:
        {
            "click .close": "_removePod",
        },

        modelEvents: {},

        initialize: function(options)
        {
            this.childView = options.childView;
            this.sizer = options.sizer;
            this._watchForWindowResize();
            this.on("pod:resize", _.bind(this._onResize, this));
            this.on("pod:resize:stop", _.bind(this._updateRowsAndCols, this));
            this.listenTo(this.childView, "close", _.bind(this.close, this));
            this.listenTo(this.childView, "item:rendered", _.bind(this._onChildRender, this));
            this.listenTo(this.childView, "noData", _.bind(this._onChildHasNoData, this));
            this.listenTo(this.childView, "hasData", _.bind(this._onChildHasData, this));
        },

        _watchForWindowResize: function ()
        {
            var self = this;
            $(window).on("resize.expandoMap", function(e)
            {
                if(e.target === window)
                {
                    self.trigger("pod:resize");
                }
            });
            this.on("close", function ()
            {
                $(window).off("resize.expandoMap");
            }, this);
        },

        _onResize: function()
        {
            this.$el.height(Math.floor(this.sizer.height() + 10) * this.$el.data("rows") - 10);
            this.$el.width(Math.floor(this.sizer.width() + 10) * this.$el.data("cols") - 10);
            this.childView.trigger("pod:resize");
        },

        onRender: function()
        {
            var self = this;
            var $child = this.$(".expandoPodContent");
            this.childView.setElement($child);
            $child.addClass(this.childView.className);
            if(this.childView.wrapperClassName)
            {
                this.$el.addClass(this.childView.wrapperClassName);
            }

            this.childView.render();
        },

        onShow: function()
        {
            this._onResize();
            this.childView.triggerMethod("show");
        },

        onClose: function()
        {
            this.childView.close();
        },

        _updateRowsAndCols: function()
        {
            this.model.set({
                heightInRows: parseInt(this.$el.data("rows"), 10),
                widthInColumns: parseInt(this.$el.data("cols"), 10)
            });
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
        },

        _removePod: function()
        {
            this.model.destroy();
        }

    });

    return ExpandoPodView;

});
