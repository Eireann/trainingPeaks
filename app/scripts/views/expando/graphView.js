define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/jquery.flot.zoom",
    "hbs!templates/views/expando/graphTemplate"
],
function(TP, DataParser, getDefaultFlotOptions, flotCustomToolTip, flotZoom, graphTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: graphTemplate
        },
        
        initialize: function(options)
        {
            _.bindAll(this, "createFlotGraph");
            var width = this.$el.parent().width();
            var height = 400;
            
            this.$el.width(width);
            this.$el.height(height);

            if (!options.detailDataPromise)
                throw "detailDataPromise is required for map and graph view";

            this.detailDataPromise = options.detailDataPromise;
        },
        
        onRender: function()
        {
            var self = this;
            setImmediate(function() { self.detailDataPromise.then(self.createFlotGraph); });
        },
        
        createFlotGraph: function ()
        {
            var flatSamples = this.model.get("detailData").get("flatSamples");

            if (!this.dataParser)
            {
                this.dataParser = new DataParser();
                this.dataParser.loadData(flatSamples);
            }

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);

            this.flotOptions = getDefaultFlotOptions(series);

            this.flotOptions.selection.mode = "x";
            this.flotOptions.yaxes = yaxes;
            this.flotOptions.zoom = { enabled: true };
            this.flotOptions.zoom.dataParser = this.dataParser;

            this.createFlotPlot(series);
        },

        createFlotPlot: function (data)
        {
            $.plot(this.$el, data, this.flotOptions);
        }
    });
});