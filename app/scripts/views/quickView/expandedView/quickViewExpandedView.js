define(
[
    "TP",
    "utilities/charting/dataParser",
    "utilities/conversion/convertToViewUnits",
    "utilities/units/labels",
    "hbs!templates/views/quickView/quickViewExpandedView",
    "hbs!templates/views/quickView/expandedView/flotToolTip"
],
function (TP, DataParser, convertToViewUnits, unitLabels, expandedViewTemplate, flotToolTipTemplate)
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

        initialize: function()
        {
        },
        
        onRender: function()
        {
            var self = this;

            if (!this.model.get("detailData").attributes.flatSamples)
                return;
            
            setImmediate(function()
            {
                self.createFlotGraphOnContainer();
            });
        },

        generateTooltipHtml: function(series, hoveredSeries, hoveredIndex, timeOffset)
        {
            var toolTipData =
            {
                timeOffset: null,
                series: []
            };

            toolTipData.timeOffset = timeOffset;
            _.each(series, function(s)
            {
                var value = s.data[hoveredIndex][1];
                
                //TODO Refactor!
                var fieldName = s.label.toLowerCase();
                var config =
                {
                    label: s.label,
                    value: convertToViewUnits(value, fieldName),
                    units: unitLabels(fieldName) 
                };

                if (s.label === hoveredSeries)
                    config.current = true;

                toolTipData.series.push(config);
            });

            return flotToolTipTemplate(toolTipData);
        },
        
        createFlotGraphOnContainer: function()
        {
            var self = this;

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
                        $tooltipEl.html(self.generateTooltipHtml(series, flotItem.series.label, flotItem.dataIndex, flotItem.datapoint[0]));
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