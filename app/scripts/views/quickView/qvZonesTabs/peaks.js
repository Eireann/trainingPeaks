define(
[
    "underscore",
    "TP",
    "utilities/data/timeInZonesGenerator",
    "views/charts/heartRatePeaksChart",
    "views/charts/powerPeaksChart",
    "views/charts/speedPeaksChart",
    "hbs!templates/views/quickView/zonesTab/peakTableRow"
],
function(
    _,
    TP,
    timeInZonesGenerator,
    HRPeaksChartView,
    PowerPeaksChartView,
    SpeedPeaksChartView,
    peakRowTemplate
)
{
    var peaksMixin =
    {
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
            // big change - i.e. initial load from server - rerender whole tab
            this.model.on("change:meanMax" + this.metric + "s", this.reRenderOnChange, this);

            // small change - i.e. stickit edit, just update the graph
            this.model.on("change:meanMax" + this.metric + "s.meanMaxes.*", this.onPeaksChange, this);
            this.on("close", this.stopWatchingPeaksChanges, this);
        },

        stopWatchingPeaksChanges: function()
        {
            this.model.off("change:meanMax" + this.metric + "s", this.reRenderOnChange, this);
            this.model.off("change:meanMax" + this.metric + "s.meanMaxes.*", this.onPeaksChange, this);
        },

        renderPeaks: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
            var peaks = this.getPeaksData();
            this.renderPeaksTable(peaks);
            this.renderPeaksChart(peaks, timeInZones);
        },

        onPeaksChange: function()
        {
            var timeInZones = timeInZonesGenerator(this.metric, this.zoneSettingName, this.model, this.workoutModel);
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
            }
            else
            {
                this.$(".peaksTable").html("");
            }
        },

        renderPeaksChart: function(peaks, timeInZones)
        {
            var view;
            if (this.metric === "HeartRate")
            {
                view = new HRPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Power")
            {
                view = new PowerPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones });
                view.render();
            }
            else if (this.metric === "Speed")
            {
                view = new SpeedPeaksChartView({ el: this.$(".peaksChart"), peaks: peaks, timeInZones: timeInZones, workoutType: this.workoutModel.get("workoutTypeValueId") });
                view.render();
            }
        },

        getPeaksData: function()
        {
            var peaks = this.model.get("meanMax" + this.metric + "s");
            return this.cleanAndFormatPeaksData(peaks);
        },

        defaultPeakSettings:
        [
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
            var meanMaxes = this.model.get("meanMax" + this.metric + "s");
            if (!meanMaxes || !meanMaxes.meanMaxes)
            {
                this.model.set("meanMax" + this.metric + "s", { id: 0, meanMaxes: [] });
            }

            var peaks = this.model.get("meanMax" + this.metric + "s.meanMaxes");

            var allPeaksByLabel = {};
            _.each(peaks, function(peak, index)
            {
                peak.modelArrayIndex = index;
                allPeaksByLabel[peak.label] = peak;
            }, this);


            _.each(this.defaultPeakSettings, function(label)
            {
                if (!allPeaksByLabel.hasOwnProperty(label))
                {
                    peaks.push({
                        label: label,
                        value: null
                    });
                }

            }, this);

            this.model.set("meanMax" + this.metric + "s.meanMaxes", peaks, { silent: true });
        },

        cleanAndFormatPeaksData: function(peaksData)
        {

            var allPeaksByLabel = {};
            if (peaksData.meanMaxes)
            {
                _.each(peaksData.meanMaxes, function(peak, index)
                {
                    var peakClone = _.clone(peak);
                    peakClone.modelArrayIndex = index;
                    allPeaksByLabel[peakClone.label] = peakClone;
                }, this);
            }


            var formattedPeaks = [];
            _.each(this.defaultPeakSettings, function(label)
            {
                // display every peak with a formatted label and zero default value
                var formattedLabel = this.formatMeanMaxLabel(label);
                var peakValue = null;
                var modelArrayIndex = null;

                // if there is a value in the workout, display it
                if (allPeaksByLabel.hasOwnProperty(label))
                {
                    var peak = allPeaksByLabel[label];
                    peakValue = peak.value;
                    modelArrayIndex = peak.modelArrayIndex;
                }

                formattedPeaks.push(
                {
                    id: label,
                    label: formattedLabel,
                    value: peakValue,
                    modelArrayIndex: modelArrayIndex
                }
                );
            }, this);

            return formattedPeaks;
        },

        formatMeanMaxLabel: function(label)
        {
            // Change MM100Meters to "100 Meters", or MMHalfMarathon to "Half Marathon"
            // change 1 Minute to 60 Seconds and 1 Hour to 60 Minutes
            return label.replace(/^MM/, "").replace(/([0-9]+)/g, "$1 ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/1 Minute/, "60 Seconds").replace(/1 Hour/, "60 minutes");
        }
    };

    return peaksMixin;

});