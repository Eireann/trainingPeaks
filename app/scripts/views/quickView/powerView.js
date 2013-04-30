define(
[
    "TP",
    "hbs!templates/views/quickView/power/powerTabView",
    "hbs!templates/views/quickView/power/powerZoneRow",
    "hbs!templates/views/quickView/power/powerPeakRow",
    "hbs!templates/views/quickView/power/timeInZoneGraphTooltip"
],
function (TP, powerTabTemplate,
    powerZoneRowTemplate,
    powerPeakRowTemplate,
    timeInZoneTooltipTemplate)
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
            "powerByZonesChart": "#powerByZonesChart",
            "powerPeaksChart": "#powerPeaksChart",
            "powerByZonesTable": "#powerByZonesTable",
            "powerPeaksTable": "#powerPeaksTable"
        },

        onRender: function ()
        {
            this.renderTimeInZones();
            this.renderPeaks();
            this.watchForModelChanges();
        },

        watchForModelChanges: function ()
        {
            this.model.get("details").on("change:timeInPowerZones", this.renderTimeInZones, this);
            this.model.get("details").on("change:meanMaxPower", this.renderPeaks, this);
            this.on("close", this.stopWatchingModelChanges, this);
        },

        stopWatchingModelChanges: function ()
        {
            this.model.get("details").off("change:timeInPowerZones", this.renderTimeInZones, this);
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
                this.ui.powerByZonesTable.html(zonesHtml);
            } else
            {
                this.ui.powerByZonesTable.html("");
            }
        },

        renderTimeInZonesChart: function (timeInZones)
        {
            if (timeInZones)
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
                        percentMPowerMin: this.toPercent(timeInZone.minimum, timeInZones.maximum),
                        percentMPowerMax: this.toPercent(timeInZone.maximum, timeInZones.maximum),
                        seconds: timeInZone.seconds,
                        y: minutes,
                        x: index
                    };

                    chartPoints.push(point);

                }, this);

                //powerGraphCreator.renderTimeInZonesGraph(this.ui.powerByZonesChart, chartPoints, timeInZoneTooltipTemplate);
            } else
            {
                this.ui.powerByZonesChart.html("");
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
        },

        renderPeaksTable: function (peaks)
        {
            if (peaks)
            {
                var peaksHtml = powerPeakRowTemplate({ peaks: peaks });
                this.ui.powerPeaksTable.html(peaksHtml);
            } else
            {
                this.ui.powerPeaksTable.html("");
            }
        },

        renderPeaksChart: function (peaks)
        {
            if (peaks)
            {

            } else
            {
                this.ui.powerPeaksChart.html("");
            }
        },

        getPeaksData: function ()
        {
            var powerPeaks = this.model.get("details").get("meanMaxPower");

            var allPeaksByLabel = {};
            _.each(powerPeaks, function (powerPeak)
            {
                allPeaksByLabel[powerPeak.label] = powerPeak;
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
