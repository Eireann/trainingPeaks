define(
[
    "TP",
    "hbs!templates/views/quickView/pace/paceTabView",
    "hbs!templates/views/quickView/pace/paceZoneRow",
    "hbs!templates/views/quickView/pace/pacePeakRow",
    "hbs!templates/views/quickView/pace/timeInZoneChartTooltip",
    "hbs!templates/views/quickView/pace/peakChartTooltip"
],
function (TP,
    paceTabTemplate,
    paceZoneRowTemplate,
    pacePeakRowTemplate,
    timeInZoneTooltipTemplate,
    peaksTooltipTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewPaceTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: paceTabTemplate
        },

        defaultPeakSettings: [
            'MM2Seconds',
            'MM5Seconds',
            'MM10Seconds',
            'MM12Seconds',
            'MM20Seconds',
            'MM30Seconds',
            'MM1Minute',
            'MM2Minutes',
            'MM5Minutes',
            'MM6Minutes',
            'MM10Minutes',
            'MM12Minutes',
            'MM20Minutes',
            'MM30Minutes',
            'MM1Hour',
            'MM90Minutes'
        ],

        onRender: function ()
        {
            this.renderTimeInZones();
            this.renderPeaks();
            this.watchForModelChanges();
        },

        watchForModelChanges: function ()
        {
            this.model.get("details").on("change:timeInSpeedZones", this.renderTimeInZones, this);
            this.model.get("details").on("change:meanMaxSpeed", this.renderPeaks, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.get("details").off("change:timeInSpeedZones", this.renderTimeInZones, this);
            this.model.get("details").off("change:meanMaxSpeed", this.renderPeaks, this);
        },

        renderTimeInZones: function ()
        {
            var timeInZones = this.model.get("details").get("timeInSpeedZones");
            this.renderTimeInZonesTable(timeInZones);
            this.renderTimeInZonesChart(timeInZones);
        },

        renderTimeInZonesTable: function (timeInZones)
        {
            if (timeInZones)
            {
                var zonesHtml = paceZoneRowTemplate(timeInZones);
                this.$("#paceByZonesTable").html(zonesHtml);
            } else
            {
                this.$("#paceByZonesTable").html("");
            }
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
                    percentMPaceMin: this.toPercent(timeInZone.minimum, timeInZones.maximum),
                    percentMPaceMax: this.toPercent(timeInZone.maximum, timeInZones.maximum),
                    seconds: timeInZone.seconds,
                    y: minutes,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

        },

        renderTimeInZonesChart: function (timeInZones)
        {
            if (timeInZones)
            {
                var chartPoints = this.buildTimeInZonesChartPoints(timeInZones);

                var chartOptions = {
                    title:
                    {
                        text: "Pace by Zones"
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
                TP.utils.chartBuilder.renderColumnChart(this.$("#paceByZonesChart"), chartPoints, timeInZoneTooltipTemplate, chartOptions);
            } else
            {
                this.$("#paceByZonesChart").html("");
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
                var peaksHtml = pacePeakRowTemplate({ peaks: peaks });
                this.$("#pacePeaksTable").html(peaksHtml);
            } else
            {
                this.$("#pacePeaksTable").html("");
            }
        },

        buildPeaksChartPoints: function (peaks)
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

        getPeakChartCategories: function (chartPoints)
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

        formatPeakChartLabel: function (label)
        {
            return label.replace(/ /g, "").replace(/Minutes/, "min").replace(/Seconds/, "sec").replace(/Hour/, "hr");
        },

        findMinimum: function (peaks)
        {
            var min = 0;

            _.each(peaks, function (peak)
            {
                if ((!min && peak.value) || (peak.value && peak.value < min))
                    min = peak.value;
            });
            return min;
        },

        renderPeaksChart: function (peaks)
        {
            if (peaks && peaks.length)
            {
                var chartPoints = this.buildPeaksChartPoints(peaks);

                var chartOptions = {
                    title:
                    {
                        text: "Peak Pace"
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
                            text: 'min/mile'
                        },
                        min: this.findMinimum(peaks) - 1
                    }
                };
                TP.utils.chartBuilder.renderSplineChart(this.$("#pacePeaksChart"), chartPoints, peaksTooltipTemplate, chartOptions);
            } else
            {
                this.$("#pacePeaksChart").html("");
            }
        },

        getPeaksData: function ()
        {
            var pacePeaks = this.model.get("details").get("meanMaxSpeed");

            var allPeaksByLabel = {};
            _.each(pacePeaks, function (pacePeak)
            {
                allPeaksByLabel[pacePeak.label] = pacePeak;
            }, this);


            var enabledPeaks = [];
            _.each(this.defaultPeakSettings, function (label)
            {
                if (allPeaksByLabel.hasOwnProperty(label))
                {
                    var peak = allPeaksByLabel[label];
                    enabledPeaks.push(
                        {
                            label: this.formatMeanMaxLabel(peak.label),
                            value: peak.value
                        }
                    );
                }
            }, this);

            return enabledPeaks;
        },

        formatMeanMaxLabel: function (label)
        {
            // Change MM100Meters to "100 Meters", or MMHalfMarathon to "Half Marathon"
            return label.replace(/^MM/, "").replace(/([0-9]+)/g, "$1 ").replace(/([a-z])([A-Z])/g, "$1 $2");
        }
    });
    
});
