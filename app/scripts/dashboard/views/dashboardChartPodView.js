define(
[
    "jquery",
    "moment",
    "underscore",
    "setImmediate",
    "TP",
    "views/dashboard/chartUtils",
    "utilities/charting/flotToolTipPositioner",
    "hbs!templates/views/charts/chartTooltip"
],
function(
    $,
    moment,
    _,
    setImmediate,
    TP,
    ChartUtils,
    toolTipPositioner,
    tooltipTemplate
)
{
    
    var DashboardChartPodView = TP.ItemView.extend(
    {
        modelEvents: {},

        events:
        {
            "plotclick .chartContainer": "_onPlotClick"
        },

        ui:
        {
            chartContainer: ".chartContainer",
            chartTitle: ".chartTitle"
        },

        initialize: function()
        {
            _.bindAll(this, "_onHoverToolTip", "_renderFlotChart", "waitingOff");
        },

        render: function()
        {
            this.bindUIElements();
            this.$(".chartTitle").text(this._podTitle());
            this.waitingOn();
            this.model.buildChart().done(this._renderFlotChart).always(this.waitingOff);
        },

        _onHoverToolTip: function(flotItem, $tooltipEl)
        {
            var tooltipHTML = tooltipTemplate({ tooltips: this.model.buildTooltipData(flotItem) });
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
            this.$currentToolTip = $tooltipEl;
        },

        _hideToolTip: function()
        {
            if(this.$currentToolTip)
            {
                this.$currentToolTip.remove();
            } 
        },

        _podTitle: function()
        {
            return this.model.get("title") || _.result(this.model, "defaultTitle");
        },

        _renderFlotChart: function(chartOptions)
        {

            this.$(".chartTitle").text(this._podTitle());
            this.$(".customDateRange").text(this._dateRangeText());
            if(!chartOptions)
            {
                this.$el.addClass("noData");
                this.$(".xaxisLabel").text("");
                this.$(".yaxisLabel").text("");
            }
            else
            {
                this.$el.removeClass("noData");
                if ($.plot)
                {
                    if(chartOptions.flotOptions && chartOptions.flotOptions.tooltipOpts)
                    {
                        chartOptions.flotOptions.tooltipOpts.onHover = this._onHoverToolTip;
                    }

                    var lastYaxis = _.last(chartOptions.flotOptions.yaxes);
                    if (lastYaxis)
                    {
                        lastYaxis.tickLength = 1;
                    }

                    this.plot = $.plot(this.ui.chartContainer, chartOptions.dataSeries, chartOptions.flotOptions);

                    var xaxisOpts = chartOptions.flotOptions.xaxis;
                    this.$(".xaxisLabel").text(xaxisOpts && xaxisOpts.label || "");

                    var yaxisOpts = chartOptions.flotOptions.yaxis;
                    var yaxesOpts = chartOptions.flotOptions.yaxes;
                    if (yaxisOpts)
                    {
                        this.$(".yaxisLabel.left").text(yaxisOpts && yaxisOpts.label || "");
                    }
                    else if (yaxesOpts)
                    {
                        this.$(".yaxisLabel.left")
                        .text(yaxesOpts && yaxesOpts[0] && yaxesOpts[0].label || "")
                        .css("color", yaxesOpts && yaxesOpts[0] && yaxesOpts[0].font && yaxesOpts[0].font.color);
                        this.$(".yaxisLabel.right")
                        .text(yaxesOpts && yaxesOpts[1] && yaxesOpts[1].label || "")
                        .css("color", yaxesOpts && yaxesOpts[1] && yaxesOpts[1].font && yaxesOpts[1].font.color);
                    }
                }
            }
        },

        _onPlotClick: function(event, position, item)
        {
            var onClickView = this.model.createItemDetailView(item, position);
            if(onClickView)
            {
                onClickView.render();
            }
        },

        _dateRangeText: function()
        {
            // show a subtitle in the pod view that displays the currently selected Date Range, 
            // but only if not using the Dashboard Global setting
            var dateOptions = this.model.get('dateOptions'),
                quickDateSelectOption = dateOptions.quickDateSelectOption;

            var chartDateOption = ChartUtils.findChartDateOption(quickDateSelectOption);

            if (chartDateOption.customStartDate)
            {
                dateOptions = ChartUtils.buildChartParameters(dateOptions);
                return TP.utils.datetime.format(dateOptions.startDate) + " - " + TP.utils.datetime.format(dateOptions.endDate);
            } else if (quickDateSelectOption && quickDateSelectOption !== 1)
            {
                return chartDateOption.label;
            }
            return "";
        },

        onClose: function()
        {
            this._hideToolTip();
        }

    });

    return DashboardChartPodView;

});
