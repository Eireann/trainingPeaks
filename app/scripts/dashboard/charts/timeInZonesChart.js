define(
[
    "underscore",
    "TP",
    "framework/chart",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "dashboard/views/timeInZonesChartSettings"
],
function(
    _,
    TP,
    Chart,
    chartColors,
    defaultFlotOptions,
    DashboardChartUtils,
    TimeInZonesChartSettingsView
)
{

    var HR = 17;
    var Power = 24;
    var Speed = 26;

    var TimeInZonesChart = Chart.extend({

        settingsView: TimeInZonesChartSettingsView,

        defaults: {
            workoutTypeIds: []
        },

        initialize: function(attributes, options)
        {
            this._validateWorkoutTypes();
        },

        fetchData: function()
        {
            var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var postData = {
                workoutTypeIds: _.without(this.get("workoutTypeIds"), 0, "0", ""),
                timeInZonesType: this._getTimeInZonesType() 
            };
            return this.dataManager.fetchReport("timeinzones", dateOptions.startDate, dateOptions.endDate, postData);
        },

        buildTooltipData: function(flotItem)
        {
            var zoneNumber = flotItem.dataIndex + 1;
            var zoneMinutes = this._data["zone" + zoneNumber + "Minutes"];
            var zonePercent = 100 * zoneMinutes / this._totalMinutes;
            var tips = [];
            tips.push({ label: "Zone " + zoneNumber });
            tips.push({ label: "Time", value: TP.utils.conversion.formatUnitsValue("minutes", zoneMinutes) });
            tips.push({ label: "Percent", value: TP.utils.conversion.formatUnitsValue("%", zonePercent) + "%" });
            return tips;
        },

        defaultTitle: function()
        {
            var title = TP.utils.translate("Time In " + this._getChartName() + " Zones: ");
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            return title;
        },

        parseData: function(data)
        {
            this._data = data;
            var chartColor = this._getChartColor(); 
            var flotPoints = this._buildPoints(data);
            this._totalMinutes = this._calculateTotalMinutes(flotPoints);
            if(flotPoints && flotPoints.length)
            {
                var series = this._buildFlotDataSeries(flotPoints, chartColor);
                var options = this._buildFlotChartOptions(flotPoints.length);
                return { dataSeries: series, flotOptions: options };
            } else {
                return null;
            }
        },

        getChartName: function()
        {
            return "Time In Zones";
        },

        _getChartColor: function()
        {
            switch(this.get("chartType"))
            {
                case HR:
                    return chartColors.gradients.heartRate;

                case Power:
                    return chartColors.gradients.power;

                case Speed:
                    return chartColors.gradients.pace;
            }
        },

        _getChartName: function()
        {
            switch(this.get("chartType"))
            {
                case HR:
                    return "Heart Rate";

                case Power:
                    return "Power";

                case Speed:
                    return "Speed";
            }
        },

        _getTimeInZonesType: function()
        {
            switch(this.get("chartType"))
            {
                case HR:
                    return 1;

                case Power:
                    return 2;

                case Speed:
                    return 3;
            }
        },

        _buildPoints: function(data)
        {
            var points = [];
            var maxZoneWithMinutes = 0;
            for(var i = 1;i<=10;i++)
            {
                var zoneKey = "zone" + i + "Minutes";
                var minutes = data.hasOwnProperty(zoneKey) ? data[zoneKey] : 0;
                points.push([i, minutes]);
                if(minutes)
                {
                    maxZoneWithMinutes = i;
                }
            }
            return points.slice(0, maxZoneWithMinutes);
        },

        _calculateTotalMinutes: function(flotPoints)
        {
            var minutes = 0;
            _.each(flotPoints, function(point)
            {
                minutes += point[1];
            });
            return minutes;
        },

        _buildFlotDataSeries: function (chartPoints, chartColor)
        {
            var dataSeries =
            {
                data: chartPoints,
                bars:
                {
                    show: true,
                    lineWidth: 0,
                    fill: true,
                    fillColor: { colors: [chartColor.light, chartColor.dark] }
                },
                highlightColor: chartColor.light
            };

            return [dataSeries];
        },

        _buildFlotChartOptions: function(numberOfColumns)
        {
            var flotOptions = defaultFlotOptions.getBarOptions();

            flotOptions.yaxis = {
                min: 0,
                tickFormatter: function(zoneMinutes)
                {
                    return TP.utils.conversion.formatUnitsValue("minutes", zoneMinutes, { defaultValue: "0:00" });
                }
            };

            var xTicks = [];
            for(var i = 1; i<= numberOfColumns;i++)
            {
                xTicks.push(i);
            }
            
            flotOptions.xaxis = {
                tickDecimals: 0,
                ticks: xTicks,
                color: "transparent"
            }; 

            flotOptions.bars.align = "center";

            return flotOptions;
        },

        _validateWorkoutTypes: function()
        {
            if(!this.get("workoutTypeIds"))
            {
                this.set("workoutTypeIds", []);
            }
        }

    });

    return TimeInZonesChart;

});
