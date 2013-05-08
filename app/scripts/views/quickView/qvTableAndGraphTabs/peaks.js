define(
[
    "underscore",
    "TP",
    "hbs!templates/views/quickView/heartRate/hrPeakRow",
    "hbs!templates/views/quickView/heartRate/peakChartTooltip"
],
function(
    _,
    TP,
    hrPeakRowTemplate,
    peaksTooltipTemplate
)
{

    var peaksMixin = {

        initializePeaks: function()
        {
            this.on("render", this.onRenderPeaks, this);
        },

        onRenderPeaks: function()
        {
            this.initializePeakDataOnModel();
            this.renderPeaks();
            this.watchForPeaksChanges();
        },

        watchForPeaksChanges: function()
        {
            this.model.on("change:meanMaxHeartRate", this.updatePeaksChart, this);
            this.on("close", this.stopWatchingPeaksChanges, this);
        },

        stopWatchingPeaksChanges: function()
        {
            this.model.off("change:meanMaxHeartRate", this.updatePeaksChart, this);
        },

        renderPeaks: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks, timeInZones);
        },

        updatePeaksChart: function()
        {
            console.log("Updating peaks chart");
            var timeInZones = this.getOrCreateTimeInZones();
            var peaks = this.getPeaksData();
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
                    percentLT: TP.utils.conversion.toPercent(peak.value, timeInZones.threshold),
                    percentMHR: TP.utils.conversion.toPercent(peak.value, timeInZones.maximum),
                    y: peak.value,
                    x: index
                };

                chartPoints.push(point);

            }, this);

            return chartPoints;

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
                        categories: TP.utils.chartBuilder.getPeakChartCategories(chartPoints)
                    },
                    yAxis: {
                        title: {
                            text: 'BPM'
                        }
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
            var hrPeaks = this.model.get("meanMaxHeartRate");
            return TP.utils.chartBuilder.cleanAndFormatPeaksData(hrPeaks);
        },

        defaultPeakSettings: [
            //'MM2Seconds',
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

        initializePeakDataOnModel: function()
        {
            var hrPeaks = this.model.get("meanMaxHeartRate");

            if (!hrPeaks)
            {
                hrPeaks = [];
            }

            var allPeaksByLabel = {};
            _.each(hrPeaks, function(peak, index)
            {
                peak.modelArrayIndex = index;
                allPeaksByLabel[peak.label] = peak;
            }, this);


            _.each(this.defaultPeakSettings, function (label)
            {
                if (!allPeaksByLabel.hasOwnProperty(label))
                {
                    hrPeaks.push({
                        label: label,
                        value: null
                    });
                }

            }, this);

            this.model.set("meanMaxHeartRate", hrPeaks, { silent: true });
        }

    };

    return peaksMixin;

});