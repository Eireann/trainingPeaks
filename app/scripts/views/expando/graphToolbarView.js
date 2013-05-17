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