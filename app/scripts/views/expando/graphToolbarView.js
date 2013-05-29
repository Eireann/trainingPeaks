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
            "click button.graphSeriesButton": "onGraphSeriesButtonClicked"
        },
        
        onFilterPeriodChanged: function(event)
        {
            if (!event.target)
                return;

            var period = parseInt(event.target.value, 10);
            this.trigger("filterPeriodChanged", period);
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
        }
    });
});