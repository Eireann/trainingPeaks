define(
[
    "TP",
    "hbs!templates/views/quickView/heartRate/hrTabView",
    "hbs!templates/views/quickView/heartRate/hrZoneRow",
    "hbs!templates/views/quickView/heartRate/hrPeakRow",
    "hbs!templates/views/quickView/heartRate/timeInZoneChartTooltip",
    "hbs!templates/views/quickView/heartRate/peakChartTooltip"
],
function(
    TP,
    hrTabTemplate,
    hrZoneRowTemplate,
    hrPeakRowTemplate,
    timeInZoneTooltipTemplate,
    peaksTooltipTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewHrTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: hrTabTemplate
        },
        
        initialize: function()
        {
            // turn off the default TP item view on change event ...
            delete this.modelEvents.change;
        },

        onRender: function()
        {
            this.renderTimeInZones();
            this.renderPeaks();
            this.watchForModelChanges();
        },

        watchForModelChanges: function()
        {
            this.model.get("details").on("change:timeInHeartRateZones", this.renderTimeInZones, this);
            this.model.get("details").on("change:meanMaxHeartRate", this.renderPeaks, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function()
        {
            this.model.get("details").off("change:timeInHeartRateZones", this.renderTimeInZones, this);
            this.model.get("details").off("change:meanMaxHeartRate", this.renderPeaks, this);
        },

        renderTimeInZones: function()
        {
            var timeInZones = this.model.get("details").get("timeInHeartRateZones");
            this.renderTimeInZonesTable(timeInZones);
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
            var totalHours = this.model.get("totalTime");
            // zone times are in seconds, convert to minutes
            _.each(timeInZones.timeInZones, function(timeInZone, index)
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
                    y: minutes,
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

        toPercent: function(numerator, denominator)
        {
            return Math.round((numerator / denominator) * 100);
        },

        renderPeaks: function()
        {
            var timeInZones = this.model.get("details").get("timeInHeartRateZones");
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks, timeInZones);
        },

        renderPeaksTable: function(peaks)
        {
            if (peaks)
            {
                var peaksHtml = hrPeakRowTemplate({ peaks: peaks });
                this.$("#heartRatePeaksTable").html(peaksHtml);
            } else
            {
                this.$("#heartRatePeaksTable").html("");
            }
        },

        buildPeaksChartPoints: function(peaks, timeInZones)
        {

            var chartPoints = [];
            _.each(peaks, function(peak, index)
            {


                var point = {
                    label: peak.label,
                    value: peak.value,
                    percentLT: this.toPercent(peak.value, timeInZones.threshold),
                    percentMHR: this.toPercent(peak.value, timeInZones.maximum),
                    y: peak.value,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

        },

        getPeakChartCategories: function(chartPoints)
        {
            // list every third label
            var categories = [];
            for (var i = 0; i < chartPoints.length; i++)
            {
                if (i % 3 === 0)
                {
                    categories.push(this.formatPeakChartLabel(chartPoints[i].label));
                } else
                {
                    // need one category per point, so push empty category
                    categories.push('');
                }
            }
            return categories;
        },

        formatPeakChartLabel: function(label)
        {
            return label.replace(/ /g, "").replace(/Minutes/, "min").replace(/Seconds/, "sec").replace(/Hour/, "hr");
        },

        findMinimum: function(peaks)
        {
            var min = 0;

            _.each(peaks, function(peak)
            {
                if ((!min && peak.value) || (peak.value && peak.value < min))
                    min = peak.value;
            });
            return min;
        },

        renderPeaksChart: function(peaks, timeInZones)
        {
            if (peaks && peaks.length)
            {
                var chartPoints = this.buildPeaksChartPoints(peaks, timeInZones);

                var chartOptions = {
                    title:
                    {
                        text: "Peak Heart Rate"
                    },
                    xAxis: {
                        labels:
                        {
                            enabled: true
                        },
                        tickColor: 'transparent',
                        type: 'category',
                        categories: this.getPeakChartCategories(chartPoints)
                    },
                    yAxis: {
                        title: {
                            text: 'BPM'
                        },
                        min: this.findMinimum(peaks) - 10
                    }
                };
                TP.utils.chartBuilder.renderSplineChart(this.$("#heartRatePeaksChart"), chartPoints, peaksTooltipTemplate, chartOptions);
            } else
            {
                this.$("#heartRatePeaksChart").html("");
            }
        },

        getPeaksData: function()
        {
            var hrPeaks = this.model.get("details").get("meanMaxHeartRate");
            return TP.utils.chartBuilder.cleanAndFormatPeaksData(hrPeaks);
        }
    });
});
