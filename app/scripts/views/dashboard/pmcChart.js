define(
[
    "underscore",
    "setImmediate",
    "moment",
    "TP",
    "models/reporting/pmcModel",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "utilities/charting/flotToolTipPositioner",
    "utilities/workout/workoutTypes",
    "hbs!templates/views/dashboard/pmcChart",
    "hbs!templates/views/charts/chartTooltip"
],
function (
    _,
    setImmediate,
    moment,
    TP,
    PMCModel,
    defaultFlotOptions,
    chartColors,
    toolTipPositioner,
    workoutTypes,
    pmcChartTemplate,
    tooltipTemplate
    )
{
    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "dashboardChart doubleWide",

        template:
        {
            type: "handlebars",
            template: pmcChartTemplate
        },

        initialize: function(options)
        {
            _.bindAll(this, "onHoverToolTip");
            //remove when api endpoint is called
            this.on("render", this.renderChartAfterRender, this);
            
            var chartOptions =
            {
                startDate: moment().subtract('days', 90),
                endDate: moment()
            };
            this.model = new PMCModel(null, chartOptions);
            this.model.fetch();
            this.setTitle();
        },

        ui: 
        {
            chartContainer: ".chartContainer"
        },

        setTitle: function()
        {
            var workoutTypesLabel = "";
            _.each(this.model.workoutTypes, function(item, index)
            {
                var intItem = parseInt(item, 10);
                if (intItem === 0)
                    workoutTypesLabel += "All";
                else
                    workoutTypesLabel += workoutTypes.getNameById(intItem);

                if (index !== (this.model.workoutTypes.length-1))
                    workoutTypesLabel += ", ";
            }, this);
            this.model.set("title", "PMC - Workout Type: " + workoutTypesLabel);
        },

        renderChartAfterRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.renderChart();
            });
        },

        renderChart: function()
        {

            var chartPoints = this.buildFlotPoints();
            var dataSeries = this.buildFlotDataSeries(chartPoints, chartColors.gradients.pace);
            var flotOptions = this.buildFlotChartOptions();

            var self = this;

            // let the html draw first so our container has a height and width
            setImmediate(function()
            {
                self.renderFlotChart(dataSeries, flotOptions);
            });
        },

        buildFlotPoints: function()
        {
            var chartPoints = [];
            _.each(this.model.get("data"), function (item, index)
            {
                var dayMoment = moment(item.workoutDay).valueOf();
                chartPoints.push([dayMoment, item.tssActual]);
            }, this);
            return chartPoints;
        },
        
        buildFlotDataSeries: function (chartPoints, chartColor)
        {
            var dataSeries =
            {
                data: chartPoints,
                color: "red",
                points:
                {
                    show: true
                }
            };

            return [dataSeries];
        },

        buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getGlobalDefaultOptions(null);

            flotOptions.yaxis =
            {
                tickDecimals: 0
            };

            flotOptions.xaxis =
            {
                color: "transparent"
            };

            flotOptions.xaxes = [
            {
                tickFormatter: function(value, axis)
                {
                    var instance = moment(value);
                    //todo: base formatter on settings
                    return instance.format("MM/DD/YY");
                }
            }];

            flotOptions.tooltipOpts.onHover = this.onHoverToolTip;

            return flotOptions;
        },
        
        onHoverToolTip: function (flotItem, $tooltipEl)
        {

            var tooltipData =
            {
                tooltips:
                    [{ label: "Date", value: moment(flotItem.datapoint[0]).format("MM/DD/YY") }, { label: "TSS", value: TP.utils.conversion.formatTSS(flotItem.datapoint[1]) }]
            };
            var tooltipHTML = tooltipTemplate(tooltipData);
            $tooltipEl.html(tooltipHTML);
            toolTipPositioner.updatePosition($tooltipEl, this.plot);
        },

        renderFlotChart: function(dataSeries, flotOptions)
        {
            if ($.plot)
            {
                this.plot = $.plot(this.ui.chartContainer, dataSeries, flotOptions);
            }
        }
    });
});