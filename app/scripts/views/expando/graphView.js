define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/defaultFlotOptions",
    "utilities/charting/flotCustomTooltip",
    "utilities/charting/jquery.flot.zoom",
    "views/expando/graphToolbarView",
    "hbs!templates/views/expando/graphTemplate"
],
function (TP, DataParser, getDefaultFlotOptions, flotCustomToolTip, flotZoom, GraphToolbarView, graphTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: graphTemplate
        },
        
        initialize: function()
        {
            //TODO refactor, this should be set by CSS classes (CSS calc?)
            this.$el.width(this.$el.parent().width());
            this.$el.height(400);
        },
        
        onRender: function()
        {
            var self = this;
            setImmediate(function() { self.createFlotGraph(); });
        },
        
        createFlotGraph: function ()
        {
            if(this.model.get("detailData") === null)
                return;
            
            var flatSamples = this.model.get("detailData").attributes.flatSamples;

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
            this.flotOptions.zoom.resetButton = ".graphResetButton";

            $.plot(this.$el, series, this.flotOptions);

            this.overlayGraphToolbar();
        },
        
        overlayGraphToolbar: function()
        {
            var toolbar = new GraphToolbarView({ dataParser: this.dataParser });
            this.$el.append(toolbar.render().$el);
        }
    });
});