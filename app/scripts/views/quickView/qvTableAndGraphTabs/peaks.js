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
    peakRowTemplate,
    peaksTooltipTemplate
)
{

    var peaksMixin = {

        initializePeaks: function()
        {
            if (!this.metric)
                throw "peaks mixin requires a metric name (this.metric)";

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
            this.model.on("change:meanMax" + this.metric + ".*", this.onPeaksChange, this);
            this.on("close", this.stopWatchingPeaksChanges, this);
        },

        stopWatchingPeaksChanges: function()
        {
            this.model.off("change:meanMax" + this.metric + ".*", this.onPeaksChange, this);
        },

        renderPeaks: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks, timeInZones);
        },

        onPeaksChange: function()
        {
            var timeInZones = this.getOrCreateTimeInZones();
            var peaks = this.getPeaksData();
            this.renderPeaksChart(peaks, timeInZones);
            this.trigger("change:model", this.model);
        },

        renderPeaksTable: function(peaks)
        {
            if (peaks)
            {
                var peaksHtml = peakRowTemplate({ peaks: peaks });
                this.$(".peaksTable").html(peaksHtml);
            } else
            {
                this.$(".peaksTable").html("");
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
                TP.utils.chartBuilder.renderSplineChart(this.$(".peaksChart"), chartPoints, peaksTooltipTemplate, chartOptions);
            } else
            {
                this.$(".peaksChart").html("");
            }
        },

        getPeaksData: function()
        {
            var peaks = this.model.get("meanMax" + this.metric);
            return TP.utils.chartBuilder.cleanAndFormatPeaksData(peaks);
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
            var peaks = this.model.get("meanMax" + this.metric);

            if (!peaks)
            {
                peaks = [];
            }

            var allPeaksByLabel = {};
            _.each(peaks, function(peak, index)
            {
                peak.modelArrayIndex = index;
                allPeaksByLabel[peak.label] = peak;
            }, this);


            _.each(this.defaultPeakSettings, function (label)
            {
                if (!allPeaksByLabel.hasOwnProperty(label))
                {
                    peaks.push({
                        label: label,
                        value: null
                    });
                }

            }, this);

            this.model.set("meanMax" + this.metric, peaks, { silent: true });
        }

    };

    return peaksMixin;

});