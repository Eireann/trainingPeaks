define(
[
    "TP",
    "hbs!templates/views/expando/graphToolbar"
],
function(TP, graphToolbarTemplate)
{
    return TP.ItemView.extend(
    {
        className: "graphToolbar",
        
        template:
        {
            type: "handlebars",
            template: graphToolbarTemplate
        },
        
        initialize: function(options)
        {
            this.dataParser = options.dataParser;
        },
        
        events:
        {
            "change input[name=filterPeriod]": "onFilterPeriodChanged",
            "click button.graphSeriesButton": "onGraphSeriesButtonClicked",
            "click button.graphZoomButton": "onZoomClicked",
            "click button.graphResetButton": "onResetClicked",
            "click button.graphTimeButton": "onGraphTimeButtonClicked",
            "click button.graphDistanceButton": "onGraphDistanceButtonClicked"
        },
        
        ui:
        {
            "zoomResetButton": "button.graphResetButton"
        },
        
        onFilterPeriodChanged: function(event)
        {
            if (!event.target)
                return;

            var period = parseInt(event.target.value, 10);
            this.trigger("filterPeriodChanged", period);
        },

        setFilterPeriod: function(period)
        {
            this.$("input[name=filterPeriod]").val(period);
        },

        onGraphSeriesButtonClicked: function(event)
        {
            var clickedButton = $(event.target);
            var clickedSeries = clickedButton.attr("class").replace("graphSeriesButton ", "").replace("graph", "").replace("Button", "").replace("graphSeriesDisabled", "").trim();

            if (clickedButton.hasClass("graphSeriesDisabled"))
            {
                clickedButton.removeClass("graphSeriesDisabled");
                this.trigger("enableSeries", clickedSeries);
            }
            else
            {
                clickedButton.addClass("graphSeriesDisabled");
                this.trigger("disableSeries", clickedSeries);
            }
        },
        
        onZoomClicked: function()
        {
            this.trigger("zoom");
        },
        
        onResetClicked: function()
        {
            this.trigger("reset");
            this.hideZoomButton();
        },

        hideZoomButton: function ()
        {
            this.ui.zoomResetButton.addClass("hidden");
        },

        onGraphZoomed: function()
        {
            this.ui.zoomResetButton.removeClass("hidden");
        },

        onGraphTimeButtonClicked: function ()
        {
            this.$el.find("button.graphTimeButton").addClass("bold");
            this.$el.find("button.graphDistanceButton").removeClass("bold");
            this.trigger("enableTimeAxis");
        },
        
        onGraphDistanceButtonClicked: function ()
        {
            this.$el.find("button.graphTimeButton").removeClass("bold");
            this.$el.find("button.graphDistanceButton").addClass("bold");
            this.trigger("enableDistanceAxis");
        },

        onRender: function()
        {
            var self = this;
            var shownButtons = [];

            _.each(this.dataParser.getChannelMask(), function(channel)
            {
                if (channel === "Distance" || channel === "Latitude" || channel === "Longitude")
                    return;

                var button = self.$(".graph" + channel + "Button");
                button.show();
                shownButtons.push(button[0]);
            });
            
            this.$(".graphSeriesButton").not(shownButtons).remove();

            if (_.indexOf(this.dataParser.getChannelMask(), "Distance") === -1)
            {
                this.$(".graphDistanceButton").remove();
                this.$(".graphTimeButton").remove();
            }
        },

        serializeData: function()
        {
            // Grab speed label based on model workout type
            var speedLabel = this.model ? TP.utils.units.getUnitsLabel("speed", this.model.get("workoutTypeValueId")) : "MPH";
            var elevationlabel = this.model ? TP.utils.units.getUnitsLabel("elevation") : "FT";
            
            // Some workout type speeds need to be shown as "pace" units
            if (this.model && _.contains([1,3,13], this.model.get("workoutTypeValueId")))
            {
                speedLabel = TP.utils.units.getUnitsLabel("pace", this.model.get("workoutTypeValueId"));
            }
            return {
                speedLabel: speedLabel,
                elevationLabel: elevationlabel
            };
        }
    });
});