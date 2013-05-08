define(
[
    "underscore",
    "TP",
    "hbs!templates/views/quickView/heartRate/hrZoneRow",
    "hbs!templates/views/quickView/heartRate/timeInZoneChartTooltip"
],
function(
    _,
    TP,
    hrZoneRowTemplate,
    timeInZoneTooltipTemplate
)
{

    var timeInZonesMixin = {

        initializeTimeInZones: function()
        {
            this.on("render", this.onRenderTimeInZones, this);
        },

        onRenderTimeInZones: function()
        {
            this.renderTimeInZones();
            this.watchForTimeInZonesChanges();
        },

        watchForTimeInZonesChanges: function()
        {
            this.model.on("change:timeInHeartRateZones.timeInZones.*", this.updateTimeInZonesChart, this);
            this.on("close", this.stopWatchingTimeInZonesChanges, this);
        },

        stopWatchingTimeInZonesChanges: function()
        {
            this.model.off("change:timeInHeartRateZones.timeInZones.*", this.updateTimeInZonesChart, this);
        },

        renderTimeInZones: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            this.renderTimeInZonesTable(timeInZones);
            this.renderTimeInZonesChart(timeInZones);
        },

        updateTimeInZonesChart: function()
        {
            console.log("Updating zones chart");
            var timeInZones = this.getOrCreateTimeInZones();
            this.renderTimeInZonesChart(timeInZones);
        },

        renderTimeInZonesTable: function(timeInZones)
        {

            if (timeInZones)
            {
                var zonesHtml = hrZoneRowTemplate(timeInZones);
                this.$("#heartRateByZonesTable").html(zonesHtml);
            } else
            {
                this.$("#heartRateByZonesTable").html("");
            }
        },

        buildTimeInZonesChartPoints: function(timeInZones)
        {
            var chartPoints = [];
            var totalSeconds = TP.utils.chartBuilder.calculateTotalTimeInZones(timeInZones);
            // zone times are in seconds, convert to minutes
            _.each(timeInZones.timeInZones, function(timeInZone, index)
            {

                var minutes = timeInZone.seconds ? parseInt(timeInZone.seconds, 10) / 60 : 0;
                var hours = timeInZone.seconds ? parseInt(timeInZone.seconds, 10) / 3600 : 0;

                var point = {
                    label: timeInZone.label,
                    rangeMinimum: timeInZone.minimum,
                    rangeMaximum: timeInZone.maximum,
                    percentTime: TP.utils.conversion.toPercent(timeInZone.seconds, totalSeconds),
                    percentLTMin: TP.utils.conversion.toPercent(timeInZone.minimum, timeInZones.threshold),
                    percentLTMax: TP.utils.conversion.toPercent(timeInZone.maximum, timeInZones.threshold),
                    percentMHRMin: TP.utils.conversion.toPercent(timeInZone.minimum, timeInZones.maximum),
                    percentMHRMax: TP.utils.conversion.toPercent(timeInZone.maximum, timeInZones.maximum),
                    seconds: timeInZone.seconds,
                    y: minutes,
                    value: minutes,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

        },

        renderTimeInZonesChart: function(timeInZones)
        {
            if (timeInZones)
            {
                var chartPoints = this.buildTimeInZonesChartPoints(timeInZones);

                var chartOptions = {
                    title:
                    {
                        text: "Heart Rate by Zones"
                    },
                    xAxis: {
                        title:
                        {
                            text: "Zones"
                        }
                    },
                    yAxis: {
                        title: {
                            text: 'Minutes'
                        }
                    }
                };
                TP.utils.chartBuilder.renderColumnChart(this.$("#heartRateByZonesChart"), chartPoints, timeInZoneTooltipTemplate, chartOptions);
            } else
            {
                this.$("#heartRateByZonesChart").html("");
            }
        },

        getOrCreateTimeInZones: function()
        {

            var timeInZones = this.model.get("timeInHeartRateZones");
            if (!timeInZones)
            {
                timeInZones = this.buildTimeInZonesFromAthleteSettings();

                if (timeInZones)
                {
                    this.model.set("timeInHeartRateZones", timeInZones, { silent: true });
                }
            }

            return timeInZones;
        },

        buildTimeInZonesFromAthleteSettings: function()
        {
            var zoneSettingName = "heartRateZones";
            var workoutTypeId = this.workoutModel.get("workoutTypeValueId");
            var settings = this.getZoneSettingsByWorkoutTypeId(zoneSettingName, workoutTypeId);

            if (!settings)
                return null;

            var timeInZones = {
                maximum: settings.maximumHeartRate,
                resting: settings.restingHeartRate,
                threshold: settings.threshold,
                timeInZones: []
            };

            _.each(settings.zones, function(zone)
            {
                timeInZones.timeInZones.push({
                    seconds: 0,
                    minimum: zone.minimum,
                    maximum: zone.maximum,
                    label: zone.label
                });
            }, this);

            return timeInZones;
        }

    };

    return timeInZonesMixin;

});