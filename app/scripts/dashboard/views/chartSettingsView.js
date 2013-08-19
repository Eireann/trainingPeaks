define(
[
    "jquerySelectBox",
    "setImmediate",
    "underscore",
    "TP",
    "views/dashboard/chartUtils",
    "hbs!templates/views/dashboard/dashboardChartSettings"
],
function(
    jquerySelectBox,
    setImmediate,
    _,
    TP,
    chartUtils,
    dashboardChartSettingsTemplate
    )
{
    var ChartSettingsView = TP.ItemView.extend({

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "dashboardChartSettings",

        template:
        {
            type: "handlebars",
            template: dashboardChartSettingsTemplate
        },

        initialize: function(options)
        {
            this.initialEvents(); // Hook into modal display code
            this.model.off("change", this.render);
            this.on("close", this.saveOnClose, this);
        },

        events:
        {
            "click #closeIcon": "close"
        },

        saveOnClose: function()
        {
            this.model.save();
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
        }

    });

    return ChartSettingsView;
});

