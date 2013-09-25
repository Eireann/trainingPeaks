define(
[
    "TP"
],
function(TP)
{
    var defaultPeakSettings =
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
    ];

    var ThePeaksGenerator = function ()
    {
        this._formatMeanMaxLabel = function (label)
        {
            // change 1 Minute to 60 Seconds and 1 Hour to 60 Minutes
            return label.replace(/^MM/, "").replace(/([0-9]+)/g, "$1 ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/1 Minute/, "60 Seconds").replace(/1 Hour/, "60 Minutes");
        };
        this._formatSecondsForLabel = function(seconds)
        {
            var roundedMinutes, shouldPluralizeMinutes, minutesUnit;
            if (seconds < 61)
            {
                return seconds + " Seconds";
            } else if (seconds < 7201) // if under 2 hrs 1 second
            {
                roundedMinutes = Math.round((seconds / 60));
                shouldPluralizeMinutes = roundedMinutes !== 1;
                minutesUnit = shouldPluralizeMinutes ? " Minutes" : " Minute";
                return roundedMinutes + minutesUnit;
            } else {
                var hours = seconds / 3600;
                var fullHours = Math.floor(hours);
                var exactMinutes = (hours % 1) * 60;
                roundedMinutes = Math.round(exactMinutes);
                var shouldPluralizeHours = fullHours !== 1;
                shouldPluralizeMinutes = roundedMinutes !== 1;
                var hoursCopy = shouldPluralizeHours ? " Hours " : " Hour ";
                minutesUnit = shouldPluralizeMinutes ? " Minutes" : " Minute";

                var withMinutesString = fullHours + hoursCopy + roundedMinutes + minutesUnit;
                var withoutMinutesString = fullHours + hoursCopy;
                return roundedMinutes === 0 ? withoutMinutesString : withMinutesString;
            }
        };

        this._initializePeakDataOnModelFromTier3Data = function(metric, model)
        {
            var self = this,
                uniquePeaks = _.uniq(_.collect(model.get('peak' + metric + "s"), function(item) { return JSON.stringify(item); })),
                peaks = [];

            uniquePeaks = _.map(uniquePeaks, function(peak)
            {
                return JSON.parse(peak);
            });

            _.each(uniquePeaks, function(peak, index)
            {
                var peakSample = {};
                peakSample.modelArrayIndex = index;
                peakSample.intervalInSeconds = peak.interval;
                peakSample.label = self._formatSecondsForLabel(peak.interval);
                peakSample.value = peak.value;

                peaks.push(peakSample);
            });

            // sort peaks by interval time
            peaks = _.sortBy(peaks, function(peak) { return peak.intervalInSeconds; });

            model.set("meanMax" + metric + "s", {meanMaxes: peaks}, { silent: true });
        };

        this._initializePeakDataOnModel = function (metric, model)
        {
            if(!_.contains(["Cadence", "HeartRate", "Power", "Speed"], metric))
            {
                throw new Error("ThePeaksGenerator: " + metric + " is an invalid metric");
            }

            if (model.attributes.hasOwnProperty('flatSamples'))
            {
                return this._initializePeakDataOnModelFromTier3Data(metric, model);
            }

            var meanMaxes = model.get("meanMax" + metric + "s");
            if (!meanMaxes || !meanMaxes.meanMaxes)
            {
                model.set("meanMax" + metric + "s", { id: 0, meanMaxes: [] });
            }

            var peaks = model.get("meanMax" + metric + "s.meanMaxes");

            var allPeaksByLabel = {};
            _.each(peaks, function (peak, index)
            {
                peak.modelArrayIndex = index;
                allPeaksByLabel[peak.label] = peak;
            }, this);

            _.each(defaultPeakSettings, function (label)
            {
                if (!allPeaksByLabel.hasOwnProperty(label))
                {
                    peaks.push({
                        label: label,
                        value: null
                    });
                }

            }, this);   

            model.set("meanMax" + metric + "s.meanMaxes", peaks, { silent: true });
        };

        this._cleanAndFormatPeaksData = function (peaksData, model)
        {
            if (model.attributes.hasOwnProperty('flatSamples'))
            {
                return peaksData.meanMaxes;
            }

            var allPeaksByLabel = {};
            if (peaksData.meanMaxes)
            {
                _.each(peaksData.meanMaxes, function (peak, index)
                {
                    var peakClone = _.clone(peak);
                    peakClone.modelArrayIndex = index;
                    allPeaksByLabel[peakClone.label] = peakClone;
                }, this);
            }

            var formattedPeaks = [];
            _.each(defaultPeakSettings, function (label)
            {
                // display every peak with a formatted label and zero default value
                var formattedLabel = this._formatMeanMaxLabel(label);
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
        };
    };

    _.extend(ThePeaksGenerator.prototype,
    {
        generate: function (metric, model)
        {
            if (!model)
            {
                model = new TP.Model();
            }
            this._initializePeakDataOnModel(metric, model);
            var peaks = model.get("meanMax" + metric + "s");
            return this._cleanAndFormatPeaksData(peaks, model);
        }
    });

    return new ThePeaksGenerator();
});