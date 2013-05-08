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
    zoneRowTemplate,
    timeInZoneTooltipTemplate
)
{

    var timeInZonesMixin = {

        initializeTimeInZones: function()
        {
            if (!this.metric)
                throw "zones mixin requires a metric name (this.metric)";

            this.on("render", this.onRenderTimeInZones, this);
        },

        onRenderTimeInZones: function()
        {
            this.renderTimeInZones();
            this.watchForTimeInZonesChanges();
        },

        watchForTimeInZonesChanges: function()
        {
            this.model.on("change:timeIn" + this.metric + "Zones.timeInZones.*", this.onTimeInZonesChange, this);
            this.on("close", this.stopWatchingTimeInZonesChanges, this);
        },

        stopWatchingTimeInZonesChanges: function()
        {
            this.model.off("change:timeIn" + this.metric + "Zones.timeInZones.*", this.onTimeInZonesChange, this);
        },

        renderTimeInZones: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            this.renderTimeInZonesTable(timeInZones);
            this.renderTimeInZonesChart(timeInZones);
        },

        onTimeInZonesChange: function()
        {
            console.log("Updating zones chart");
            var timeInZones = this.getOrCreateTimeInZones();
            this.renderTimeInZonesChart(timeInZones);
            this.trigger("change:model", this.model);
        },

        renderTimeInZonesTable: function(timeInZones)
        {

            if (timeInZones)
            {
                var zonesHtml = zoneRowTemplate(timeInZones);
                this.$(".zonesTable").html(zonesHtml);
            } else
            {
                this.$(".zonesTable").html("");
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
                TP.utils.chartBuilder.renderColumnChart(this.$(".zonesChart"), chartPoints, timeInZoneTooltipTemplate, chartOptions);
            } else
            {
                this.$(".zonesChart").html("");
            }
        },

        getOrCreateTimeInZones: function()
        {

            var timeInZones = this.model.get("timeIn" + this.metric + "Zones");
            if (!timeInZones || !timeInZones.timeInZones || !timeInZones.timeInZones.length)
            {
                timeInZones = this.buildTimeInZonesFromAthleteSettings();

                if (timeInZones)
                {
                    this.model.set("timeIn" + this.metric + "Zones", timeInZones, { silent: true });
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