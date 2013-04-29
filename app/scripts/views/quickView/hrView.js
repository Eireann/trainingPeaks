define(
[
    "TP",
    "views/quickView/heartRate/graphCreator",
    "hbs!templates/views/quickView/heartRate/hrTabView",
    "hbs!templates/views/quickView/heartRate/hrZoneRow",
    "hbs!templates/views/quickView/heartRate/hrPeakRow"
],
function(TP, hrGraphCreator, hrTabTemplate, hrZoneRowTemplate, hrPeakRowTemplate)
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

        ui:
        {
            "heartRateByZonesChart": "#heartRateByZonesChart",
            "heartRatePeaksChart": "#heartRatePeaksChart",
            "heartRateByZonesTable": "#heartRateByZonesTable",
            "heartRatePeaksTable": "#heartRatePeaksTable"
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
                _.each(timeInZones.timeInZones, function(timeInZone)
                {
                    timeInZone.labelShort = timeInZone.label.split(":")[0];
                }, this);
                var zonesHtml = hrZoneRowTemplate(timeInZones);
                this.ui.heartRateByZonesTable.html(zonesHtml);
            } else
            {
                this.ui.heartRateByZonesTable.html("");
            }
        },

        renderTimeInZonesChart: function(timeInZones)
        {
            if (timeInZones)
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

                hrGraphCreator.renderTimeInZonesGraph(this.ui.heartRateByZonesChart, chartPoints);
            } else
            {
                this.ui.heartRateByZonesChart.html("");
            }
        },

        toPercent: function(numerator, denominator)
        {
            return Math.round((numerator / denominator) * 100);
        },

        renderPeaks: function()
        {
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
        },

        renderPeaksTable: function(peaks)
        {
            if (peaks)
            {
                var peaksHtml = hrPeakRowTemplate({ peaks: peaks });
                this.ui.heartRatePeaksTable.html(peaksHtml);
            } else
            {
                this.ui.heartRatePeaksTable.html("");
            }
        },

        renderPeaksChart: function(peaks)
        {
            if (peaks)
            {

            } else
            {
                this.ui.heartRatePeaksChart.html("");
            }
        },

        getPeaksData: function()
        {
            var hrPeaks = this.model.get("details").get("meanMaxHeartRate");

            var allPeaksByLabel = {};
            _.each(hrPeaks, function(hrPeak)
            {
                allPeaksByLabel[hrPeak.label] = hrPeak;
            }, this);


            var enabledPeaks = [];
            _.each(this.defaultPeakSettings, function(label)
            {
                if(allPeaksByLabel.hasOwnProperty(label))
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

        formatMeanMaxLabel: function(label)
        {
            // Change MM100Meters to "100 Meters", or MMHalfMarathon to "Half Marathon"
            return label.replace(/^MM/, "").replace(/([0-9]+)/g, "$1 ").replace(/([a-z])([A-Z])/g, "$1 $2");
        }
    });
});
