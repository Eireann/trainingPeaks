define(
[
    "jquery",
    "setImmediate",
    "underscore",
    "backbone",
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardChartSettings"
],
function(
    $,
    setImmediate,
    _,
    Backbone,
    TP,
    chartUtils,
    dashboardChartSettingsTemplate
    )
{
    var ChartSettingsView = TP.ItemView.extend(
    {
        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "dashboardChartSettings",

        modelEvents: 
        {
            "change": "_updateTitle"
        },

        template:
        {
            type: "handlebars",
            template: dashboardChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.initialEvents(); // Hook into modal display code
            this.model.off("change", this.render);
            this.on("render", this._updateTitle, this);
            this.on("render", this._fillInputs, this);
            this.on("close", this.saveOnClose, this);
            this.children = new Backbone.ChildViewContainer();
            this.on("close", _.bind(this.children.call, this.children, "close"));
        },

        events:
        {
            "click .closeIcon": "close",
            "change input.auto": "_onInputsChanged",
            "click button.apply": "apply"
        },

        saveOnClose: function()
        {
            this.model.save();
        },

        apply: function()
        {
            this.model.save();
            this.trigger("apply");
        },

        setTomahawkDirection: function(direction)
        {
            this.$el.removeClass("left").removeClass("right").addClass(direction);
        },

        alignArrowTo: function(top)
        {
            // make sure we're fully on the screen
            var windowBottom = $(window).height() - 10;
            this.top(top - 25);
            var myBottom = this.$el.offset().top + this.$el.height();

            if(myBottom > windowBottom)
            {
                var arrowOffset = (myBottom - windowBottom) + 30;
                this.top(windowBottom - this.$el.height());
                this.$(".arrow").css("top", arrowOffset + "px");
            }
        },

        _fillInputs: function()
        {
            var self = this;

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                $el.attr("checked", self.model.get($el.attr("name")));
            });

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                $el.val(self.model.get($el.attr("name")));
            });
        },

        _onInputsChanged: function()
        {
            var self = this;

            this.$('input.auto[type="checkbox"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.prop("checked"));
            });

            this.$('input.auto[type="text"]').each(function(i, el)
            {
                var $el = $(el);
                self.model.set($el.attr("name"), $el.val());
            });
        },

        _addView: function(selector, view)
        {
            if (_.isString(view))
            {
                this.$(selector).html(view);
            } else
            {
                this.$(selector).append(view.$el);
            }
            this.children.add(view);
        },

        _updateTitle: function()
        {
            this.$(".defaultTitle").text(_.result(this.model, "defaultTitle"));
        }
    });

    return ChartSettingsView;
});

