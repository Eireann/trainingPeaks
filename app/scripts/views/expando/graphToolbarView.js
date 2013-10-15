define(
[
    "TP",
    "views/expando/graphSeriesOptionsMenuView",
    "hbs!templates/views/expando/graphToolbar"
],
function(
         TP,
         GraphSeriesOptionsMenuView,
         graphToolbarTemplate)
{
    return TP.ItemView.extend(
    {
        className: "graphToolbar cf",
        
        template:
        {
            type: "handlebars",
            template: graphToolbarTemplate
        },
        
        initialize: function(options)
        {

            if (!options.dataParser)
                throw new Error("dataParser is required for expando graph toolbar view");

            if (!options.stateModel)
                throw new Error("stateModel is required for expando graph toolbar view");

            this.dataParser = options.dataParser;
            this.stateModel = options.stateModel;

            this.listenTo(this.stateModel, "change:disabledDataChannels", _.bind(this._onEnableOrDisableSeries, this));
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
            var seriesButton = $(event.target);

            var seriesName = seriesButton.data("series");
            this.seriesOptionsMenu = new GraphSeriesOptionsMenuView({ model: this.model, parentEl: this.$el, series: seriesName, stateModel: this.stateModel });
            var offset = seriesButton.offset();
            this.seriesOptionsMenu.render().top(offset.top + seriesButton.height()).left(offset.left - (seriesButton.width() / 2));
        },

        _onEnableOrDisableSeries: function()
        {
            this.$(".graphSeriesDisabled").removeClass("graphSeriesDisabled");
            _.each(this.stateModel.get("disabledDataChannels"), function(channel)
            {
                this.$("button.graphSeriesButton[data-series=" + channel + "]").addClass("graphSeriesDisabled");
            }, this);
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

            var availableChannels = this.stateModel.get("availableDataChannels");
            var disabledChannels = this.stateModel.get("disabledDataChannels");

            _.each(availableChannels, function(channel)
            {
                if (channel === "Distance" || channel === "Latitude" || channel === "Longitude")
                    return;

                var button = self.$(".graph" + channel + "Button");
                button.show();
                shownButtons.push(button[0]);

                if(_.contains(disabledChannels, channel))
                {
                    button.addClass("graphSeriesDisabled");
                }
            });
            
            this.$(".graphSeriesButton").not(shownButtons).remove();

            if(!_.contains(availableChannels, "Distance"))
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
            if (this.model && _.contains([1,3,12,13], this.model.get("workoutTypeValueId")))
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