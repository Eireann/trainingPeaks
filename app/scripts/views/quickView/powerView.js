﻿define(
[
    "TP",
    "hbs!templates/views/quickView/power/powerTabView",
    "hbs!templates/views/quickView/power/powerZoneRow",
    "hbs!templates/views/quickView/power/powerPeakRow",
    "hbs!templates/views/quickView/power/timeInZoneGraphTooltip",
    "hbs!templates/views/quickView/power/peakChartTooltip"
],
function (TP, powerTabTemplate,
    powerZoneRowTemplate,
    powerPeakRowTemplate,
    timeInZoneTooltipTemplate,
    peaksTooltipTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewPowerTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: powerTabTemplate
        },

        initialEvents: function()
        {
            this.model.off("change", this.render);
        },

        onRender: function()
        {
            this.renderTimeInZones();
            this.renderPeaks();
            this.watchForModelChanges();
        },

        watchForModelChanges: function ()
        {
            this.model.get("details").on("change:timeInPowerZones.timeInZones", this.renderTimeInZones, this);
            this.model.get("details").on("change:meanMaxPower", this.renderPeaks, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.get("details").off("change:timeInPowerZones.timeInZones", this.renderTimeInZones, this);
            this.model.get("details").off("change:meanMaxPower", this.renderPeaks, this);
        },

        renderTimeInZones: function ()
        {
            var timeInZones = this.model.get("details").get("timeInPowerZones");
            this.renderTimeInZonesTable(timeInZones);
            this.renderTimeInZonesChart(timeInZones);
        },

        renderTimeInZonesTable: function (timeInZones)
        {
            if (timeInZones)
            {
                _.each(timeInZones.timeInZones, function (timeInZone)
                {
                    timeInZone.labelShort = timeInZone.label.split(":")[0];
                }, this);
                var zonesHtml = powerZoneRowTemplate(timeInZones);
                this.$("#powerByZonesTable").html(zonesHtml);
            } else
            {
                this.$("#powerByZonesTable").html("");
            }
        },

        renderTimeInZonesChart: function (timeInZones)
        {
            if (timeInZones)
            {
                var chartPoints = this.buildTimeInZonesChartPoints(timeInZones);

                var chartOptions = {
                    title:
                    {
                        text: "Power by Zones"
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
                TP.utils.chartBuilder.renderColumnChart(this.$("#powerByZonesChart"), chartPoints, timeInZoneTooltipTemplate, chartOptions);
            } else
            {
                this.$("#powerByZonesChart").html("");
            }
        },

        toPercent: function (numerator, denominator)
        {
            return Math.round((numerator / denominator) * 100);
        },

        renderPeaks: function ()
        {
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks);
        },

        renderPeaksTable: function (peaks)
        {
            if (peaks)
            {
                var peaksHtml = powerPeakRowTemplate({ peaks: peaks });
                this.$("#powerPeaksTable").html(peaksHtml);
            } else
            {
                this.$("#powerPeaksTable").html("");
            }
        },

        renderPeaksChart: function (peaks)
        {
            if (peaks && peaks.length)
            {
                var chartPoints = this.buildPeaksChartPoints(peaks);

                var chartOptions = {
                    title:
                    {
                        text: "Peak Power"
                    },
                    xAxis: {
                        labels:
                        {
                            enabled: true
                        },
                        tickColor: 'transparent',
                        type: 'category',
                        categories: TP.utils.chartBuilder.getPeakChartCategories(chartPoints)
                    },
                    yAxis: {
                        title: {
                            text: 'Watts'
                        }
                    }
                };
                TP.utils.chartBuilder.renderSplineChart(this.$("#powerPeaksChart"), chartPoints, peaksTooltipTemplate, chartOptions);
            } else
            {
                this.$("#powerPeaksChart").html("");
            }
        },

        buildPeaksChartPoints: function(peaks)
        {
            var chartPoints = [];
            _.each(peaks, function (peak, index)
            {


                var point = {
                    label: peak.label,
                    value: peak.value,
                    y: peak.value,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

        },

        getPeaksData: function ()
        {
            var powerPeaks = this.model.get("details").get("meanMaxPower");
            return TP.utils.chartBuilder.cleanAndFormatPeaksData(powerPeaks);
        },

        buildTimeInZonesChartPoints: function (timeInZones)
        {
            var chartPoints = [];
            var totalHours = this.model.get("totalTime");
            // zone times are in seconds, convert to minutes
            _.each(timeInZones.timeInZones, function (timeInZone, index)
            {

                var minutes = timeInZone.seconds ? Number(timeInZone.seconds) / 60 : 0;
                var hours = timeInZone.seconds ? Number(timeInZone.seconds) / 3600 : 0;

                var point = {
                    label: timeInZone.label,
                    rangeMinimum: timeInZone.minimum,
                    rangeMaximum: timeInZone.maximum,
                    percentTime: this.toPercent(hours, totalHours),
                    percentLTMin: this.toPercent(timeInZone.minimum, timeInZones.threshold),
                    percentLTMax: this.toPercent(timeInZone.maximum, timeInZones.threshold),
                    percentMHRMin: this.toPercent(timeInZone.minimum, timeInZones.maximum),
                    percentMHRMax: this.toPercent(timeInZone.maximum, timeInZones.maximum),
                    seconds: timeInZone.seconds,
                    value: minutes,
                    y: minutes,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

        }
    });
});
