define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/jquery.flot.stack",
    "utilities/charting/chartColors",
    "utilities/charting/flotOptions",
    "utilities/color",
    "views/dashboard/chartUtils",
    "dashboard/views/timeInZonesChartSettings"
],
function(
    $,
    _,
    moment,
    TP,
    Chart,
    flotStack,
    chartColors,
    defaultFlotOptions,
    colorUtils,
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
        },

        fetchData: function()
        {
            this.dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
            var postData = {
                workoutTypeIds: _.without(this.get("workoutTypeIds"), 0, "0", ""),
                timeInZonesType: this._getTimeInZonesType() 
            };
            return this.dataManager.fetchReport("timeinzonesbyweek", this.dateOptions.startDate, this.dateOptions.endDate, postData);
        },

        buildTooltipData: function(flotItem)
        {
            var zoneNumber = flotItem.seriesIndex + 1;
            var weekStartDate = this._getWeekStartDate(flotItem.dataIndex);
            var weekEndDate = this._getWeekEndDate(flotItem.dataIndex);
            var zoneMinutes = flotItem.series.data[flotItem.dataIndex][1];
            var tips = [];
            tips.push({ label: TP.utils.datetime.format(weekStartDate) + " - " + TP.utils.datetime.format(weekEndDate) });
            tips.push({ label: "Zone " + zoneNumber });
            tips.push({ label: "Time", value: TP.utils.conversion.formatUnitsValue("minutes", zoneMinutes) });
            return tips;
        },


        defaultTitle: function()
        {
            var title = TP.utils.translate("Time In " + this._getChartName() + " Zones by week: ");
            title += TP.utils.workout.types.getListOfNames(this.get("workoutTypeIds"), "All Workout Types");
            return title;
        },

        parseData: function(data)
        {
            this._data = data;
            var flotPointsByZone = this._buildPoints(data);
            this._totalMinutes = this._calculateTotalMinutes(flotPointsByZone);
            var zoneColors = this._getZoneColors();
            if(flotPointsByZone && flotPointsByZone.length)
            {
                var series = this._buildFlotDataSeries(flotPointsByZone, zoneColors);
                var options = this._buildFlotChartOptions(this._data.length);
                return { dataSeries: series, flotOptions: options };
            } else {
                return null;
            }
        },

        getChartName: function()
        {
            return "Time In Zones";
        },

        _getZoneColors: function()
        {
            var zoneType = this._getChartName().replace(" ","").toLowerCase();
            return chartColors.gradients.trainingZones.hasOwnProperty(zoneType) ? chartColors.gradients.trainingZones[zoneType] : chartColors.gradients.trainingZones;
        },

        _getWeekStartDate: function(weekNumber)
        {
            var startDate = this.dateOptions.startDate.clone();
            return startDate.add("weeks", weekNumber).day(1);
        },

        _getWeekEndDate: function(weekNumber)
        {
            var startDate = this.dateOptions.startDate.clone();
            return startDate.add("weeks", weekNumber).day(7);
        },

        _formatXTick: function(weekNumber)
        {
            var totalWeeks = this._data.length;
            var formattedWeek = TP.utils.datetime.format(this._getWeekStartDate(weekNumber));
            //if(weekNumber === 1)
            //{
                return formattedWeek;
            //}
            //return ""; 
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

        _buildFlotDataSeries: function (chartPointsByZone, zoneColors)
        {
            var dataSeriesByZone = [];

            var baseColor = $.color.parse("#eaebec");
            var barColor = $.color.parse(zoneColors);

            _.each(chartPointsByZone, function(chartPoints, index)
            {
                //var opacity = 0.14 + 0.86 * (index / (chartPointsByZone.length - 1));
                var barColorWeight = 0.14 + 0.86 * (index / (chartPointsByZone.length - 1));
                var zoneColor = colorUtils.mix(barColor, baseColor, barColorWeight);
                var highlightColor = colorUtils.mix(barColor, zoneColor, 0.2);
                //var zoneColor = zoneColors.replace(/\$\$/, opacity.toFixed(2));

                var dataSeries =
                {
                    data: chartPoints,
                    bars:
                    {
                        show: true,
                        lineWidth: 0,
                        fill: true,
                        fillColor: zoneColor.rgb
                    },
                    color: zoneColor.rgb,
                    highlightColor: highlightColor.rgb
                };

                dataSeriesByZone.push(dataSeries);
            });

            return dataSeriesByZone;
        },

        _buildFlotChartOptions: function(numberOfWeeks)
        {
            var flotOptions = defaultFlotOptions.getBarOptions();

            null.undef();

            flotOptions.yaxis = {
                min: 0,
                tickFormatter: function(zoneMinutes)
                {
                    return TP.utils.conversion.formatUnitsValue("minutes", zoneMinutes, { defaultValue: "0:00" });
                }
            };
            
            flotOptions.xaxis = {
                tickFormatter: _.bind(this._formatXTick, this),
                color: "transparent"
            }; 

            // offset the start/end ticks by larger amounts when we have more weeks
            var self = this;
            flotOptions.xaxis.ticks = function(axis)
            {
                var startIndex = self._data.length > 5 ? Math.ceil(self._data.length / 20) : 0;
                var endIndex = self._data.length > 5 ? self._data.length - Math.floor(self._data.length / 10) - 1 : self._data.length - 1;

                // pad the default flot interval by a bit
                var interval = Math.ceil(axis.delta * 1.3);

                // make sure it ends on a multiple of our interval
                endIndex = Math.ceil((startIndex + endIndex) / interval) * interval;

                // add ticks between start and end index
                var ticks = [];
                for(var i = startIndex; i <= endIndex; i+= interval)
                {
                    ticks.push(i);
                }
                return ticks;

            };

            flotOptions.bars.align = "center";

            flotOptions.series.stack = true;
            flotOptions.series.stackSpacing = 1;

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
