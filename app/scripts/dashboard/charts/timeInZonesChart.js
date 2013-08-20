define(
[
    "TP",
    "framework/chart",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "dashboard/views/timeInZonesChartSettings"
],
function(
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
            this.updateChartTitle(); 
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
            tips.push({ label: "Time", value: TP.utils.conversion.formatDuration(zoneMinutes / 60) });
            tips.push({ label: "Percent", value: TP.utils.conversion.formatNumber(zonePercent) + "%" });
            return tips;
        },

        updateChartTitle: function()
        {
            var title = TP.utils.translate("Time In " + this._getChartName() + " Zones: ") + this.buildWorkoutTypesTitle(this.get("workoutTypeIds"));
            this.set("title", title);
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
                var options = this._buildFlotChartOptions();
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
                var minutes = data["zone" + i + "Minutes"];
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

        _buildFlotChartOptions: function()
        {
            var flotOptions = defaultFlotOptions.getBarOptions();

            flotOptions.yaxis = {
                min: 0,
                tickFormatter: function(zoneMinutes)
                {
                    return TP.utils.conversion.formatMinutes(zoneMinutes, { defaultValue: "0:00" });
                }
            };

            flotOptions.xaxis = {
                show: false
            };

            return flotOptions;
        },

        _validateWorkoutTypes: function()
        {
            if(!this.get("workoutTypeIds"))
            {
                this.set("workoutTypeIds", [], { silent: true });
            }
        }

    });

    return TimeInZonesChart;

});