define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/charting/flotCustomTooltip",
    "hbs!templates/views/quickView/quickViewExpandedView"
],
function (TP, DataParser, flotCustomToolTip, expandedViewTemplate)
{

    var expandedViewBase =
    {
        className: "QVExpandedView",

        template:
        {
            type: "handlebars",
            template: expandedViewTemplate
        },
        
        onClose: function()
        {
            this.collapse();
        },
        
        collapse: function()
        {
            this.$el.parent().hide();

            if (this.resetButton)
                this.resetButton.remove();

            if (this.splineButton)
                this.splineButton.remove();

            if (this.toolTip)
                this.toolTip.remove();
        },

        initialize: function(options)
        {
            _.bindAll(this, "onModelFetched");
            this.prefetchConfig = options.prefetchConfig;
        },
        
        onRender: function()
        {
            var self = this;

            this.watchForModelChanges();

            this.$el.addClass("waiting");

            if (!this.prefetchConfig.detailDataPromise)
            {
                if (this.prefetchConfig.workoutDetailDataFetchTimeout)
                    clearTimeout(this.prefetchConfig.workoutDetailDataFetchTimeout);

                this.prefetchConfig.detailDataPromise = this.model.get("detailData").fetch();
            }

            // if we already have it in memory, render it
            if (this.model.get("detailData") !== null && this.model.get("detailData").attributes.flatSamples !== null)
            {
                this.onModelFetched();
            }
            
            setImmediate(function() { self.prefetchConfig.detailDataPromise.then(self.onModelFetched); });
        },

        watchForModelChanges: function ()
        {
            this.model.on("change:detailData", this.render, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.off("change:detailData", this.render, this);
        },
        
        onModelFetched: function ()
        {
            var self = this;

            this.$el.removeClass("waiting");

            if (this.model.get("detailData") === null || this.model.get("detailData").attributes.flatSamples === null)
                return;

            setImmediate(function () { self.createFlotGraphOnContainer(); });
        },

        createFlotGraphOnContainer: function()
        {
            var flatSamples = this.model.get("detailData").attributes.flatSamples;

            if (!this.dataParser)
            {
                this.dataParser = new DataParser();
                this.dataParser.loadData(flatSamples);
            }

            var series = this.dataParser.getSeries();
            var yaxes = this.dataParser.getYAxes(series);
            
            this.flotOptions =
            {
                grid:
                {
                    show: true,
                    borderWidth: 0,
                    hoverable: true,
                    clickable: true
                },
                legend:
                {
                    show: false
                },
                selection:
                {
                    mode: "x"
                },
                tooltip: true,
                tooltipOpts:
                {
                    content: function(x, y)
                    {
                        return "";
                    },
                    onHover: function(flotItem, $tooltipEl)
                    {
                        $tooltipEl.html(flotCustomToolTip(series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0]));
                    }
                },
                series:
                {
                    lines:
                    {
                        show: true,
                        lineWidth: 0.75,
                        fill: false,
                        hoverable: true
                    }
                },
                xaxes:
                [
                    {
                        min: 0,
                        tickFormatter: function(value, axis)
                        {
                            var decimalHours = (value / (3600 * 1000)).toFixed(2);
                            return TP.utils.datetime.format.decimalHoursAsTime(decimalHours, true, null);
                        }
                    }
                ],
                yaxes: yaxes
            };

            this.createFlotPlot(series);
            this.bindZoom();
        },
        
        createFlotPlot: function(data, options)
        {
            $.plot($("#expandoGraphContainer"), data, typeof options !== "undefined" ? options : this.flotOptions);
        },

        bindZoom: function()
        {
            var self = this;
            var top = 200;
            var left = 1000;

            this.$("#expandoGraphContainer").bind("plotselected", function (event, ranges)
            {
                // Clamp the zooming to prevent eternal zoom
                if (ranges.xaxis.to - ranges.xaxis.from < 0.00001)
                    ranges.xaxis.to = ranges.xaxis.from + 0.00001;
                if (ranges.yaxis.to - ranges.yaxis.from < 0.00001)
                    ranges.yaxis.to = ranges.yaxis.from + 0.00001;

                var zoomedSeriesData = self.dataParser.getSeries(ranges.xaxis.from, ranges.xaxis.to);
                var yaxes = self.dataParser.getYAxes(zoomedSeriesData);

                var newOptions = {};
                _.extend(newOptions, self.flotOptions);
                newOptions.xaxes[0].min = ranges.xaxis.min;
                newOptions.xaxes[0].max = ranges.xaxis.max;
                newOptions.yaxes = yaxes;

                // Redraw the zoomed plot
                self.createFlotPlot(zoomedSeriesData, newOptions);

                self.resetButton = $("<button id='flotResetButton'>Reset Zoom</button>").css(
                {
                    display: "none",
                    position: "absolute",
                    zIndex: 999,
                    top: top,
                    left: left
                }).appendTo(theMarsApp.getBodyElement()).fadeIn(200);

                self.resetButton.on("click", function ()
                {
                    var fullSeriesData = self.dataParser.getSeries();
                    var yaxes = self.dataParser.getYAxes(fullSeriesData);
                    var newOptions = {};
                    _.extend(newOptions, self.flotOptions);
                    newOptions.yaxes = yaxes;
                    self.createFlotPlot(fullSeriesData, newOptions);
                    $(this).fadeOut(200).remove();
                });
            });
        }
    };

    return TP.ItemView.extend(expandedViewBase);
});