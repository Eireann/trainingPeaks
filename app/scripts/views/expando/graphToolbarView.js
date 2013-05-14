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
            _.each(this.dataParser.getChannelMask(), function(channel)
            {
                if (channel === "Distance" || channel === "Latitude" || channel === "Longitude")
                    return;

                self.$(".graph" + channel + "Button").show();
            });
        }
    });
});