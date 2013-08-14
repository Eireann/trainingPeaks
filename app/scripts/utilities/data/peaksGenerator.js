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

        this._initializePeakDataOnModel = function (metric, model)
        {
            if(!_.contains(["Cadence", "HeartRate", "Power", "Speed"], metric))
            {
                throw new Error("ThePeaksGenerator: " + metric + " is an invalid metric");
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

        this._cleanAndFormatPeaksData = function (peaksData)
        {
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
            return this._cleanAndFormatPeaksData(peaks);
        }
    });

    return new ThePeaksGenerator();
});