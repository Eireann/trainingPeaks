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
            "click .settings": "_showSettings",
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
            var cols = this.$el.data("cols");
            var rows = this.$el.data("rows");

            // Max 2 rows/columns, Min 1 row/column
            cols = Math.max(Math.min(cols, 2), 1);
            rows = Math.max(Math.min(rows, 2), 1);

            this.$el.height(Math.floor(this.sizer.height() + 10) * rows - 10);
            this.$el.width(Math.floor(this.sizer.width() + 10) * cols - 10);
            this.childView.trigger("pod:resize");
        },

        onRender: function()
        {
            var self = this;

            this.$(".expandoPodTitle").text(this.childView.podTitle);

            if(!this.childView.settingsView)
            {
                this.$(".settings").remove();
            }

            var $child = this.$(".expandoPodContent");
            this.childView.setElement($child);
            $child.addClass(this.childView.className);
            if(this.childView.wrapperClassName)
            {
                this.$el.addClass(this.childView.wrapperClassName);
            }

            this.childView.render();

            // We need titles to be in the expando pod header Rather than
            // change the templates for all charts, we are checking if the
            // template created a title element and copy the text from it into
            // our header title. This is terrible... but for now it works.
            var chartTitle = this.childView.$(".chartTitle").text();
            if(chartTitle)
            {
                this.$(".expandoPodTitle").text(chartTitle);
            }
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
        },

        _showSettings: function(e)
        {
            var settingsView = new this.childView.settingsView(
            {
                offset: "right",
                target: $(e.target),
                model: this.model
            });
            settingsView.render();

            var self = this;
            this.$el.addClass("hover");
            this.listenTo(settingsView, "close", function()
            {
                self.$el.removeClass("hover");
            });
        }

    });

    return ExpandoPodView;

});
