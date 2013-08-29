define(
[
    "TP",
    "framework/chart",
    "utilities/charting/jquery.flot.stack",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "views/dashboard/chartUtils",
    "dashboard/views/timeInZonesChartSettings"
],
function(
    TP,
    Chart,
    flotStack,
    chartColors,
    defaultFlotOptions,
    DashboardChartUtils,
    TimeInZonesChartSettingsView
)
{

    var HR = 18;
    var Power = 25;
    var Speed = 27;

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
            return this.dataManager.fetchReport("timeinzonesbyweek", dateOptions.startDate, dateOptions.endDate, postData);
        },

        buildTooltipData: function(flotItem)
        {
            var zoneNumber = flotItem.seriesIndex + 1;
            var zoneMinutes = flotItem.series.data[flotItem.dataIndex][1];
            var tips = [];
            tips.push({ label: "Zone " + zoneNumber });
            tips.push({ label: "Time", value: TP.utils.conversion.formatDuration(zoneMinutes / 60) });
            return tips;
        },


        updateChartTitle: function()
        {
            var title = TP.utils.translate("Time In " + this._getChartName() + " Zones: ");
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            this.set("title", title);
        },

        parseData: function(data)
        {
            this._data = data;
            var chartColor = this._getChartColor(); 
            var flotPointsByZone = this._buildPoints(data);
            this._totalMinutes = this._calculateTotalMinutes(flotPointsByZone);
            if(flotPointsByZone && flotPointsByZone.length)
            {
                var series = this._buildFlotDataSeries(flotPointsByZone, chartColor);
                var options = this._buildFlotChartOptions(flotPointsByZone.length);
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
            // data is an array of weeks,
            // return is an array of arrays of points per zone

            // one array per zone
            var dataPerZone = []; 
            for(var i = 0;i<10;i++)
            {
                dataPerZone.push([]);
            }

            var maxZoneWithMinutes = 0;

            _.each(data, function(tizByWeek, weekIndex)
            {
                for(i = 1;i<=10;i++)
                {
                    var zoneKey = "zone" + i + "Minutes";
                    var minutes = tizByWeek.hasOwnProperty(zoneKey) ? tizByWeek[zoneKey] : 0;
                    dataPerZone[i-1].push([weekIndex, minutes]);
                    if(minutes && i > maxZoneWithMinutes)
                    {
                        maxZoneWithMinutes = i;
                    }
                }
            });
             
            return dataPerZone.slice(0, maxZoneWithMinutes);
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

        _buildFlotDataSeries: function (chartPointsByZone, chartColor)
        {
            var dataSeriesByZone = [];

            _.each(chartPointsByZone, function(chartPoints)
            {
                var dataSeries =
                {
                    data: chartPoints,
                    bars:
                    {
                        show: true,
                        lineWidth: 0,
                        fill: true,
                        //fillColor: { colors: [chartColor.light, chartColor.dark] }
                    },
                    //highlightColor: chartColor.light
                };

                dataSeriesByZone.push(dataSeries);
            });

            return dataSeriesByZone;
        },

        _buildFlotChartOptions: function(numberOfColumns)
        {
            var flotOptions = defaultFlotOptions.getBarOptions();

            flotOptions.yaxis = {
                min: 0,
                tickFormatter: function(zoneMinutes)
                {
                    return TP.utils.conversion.formatMinutes(zoneMinutes, { defaultValue: "0:00" });
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

            flotOptions.series.stack = true;

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