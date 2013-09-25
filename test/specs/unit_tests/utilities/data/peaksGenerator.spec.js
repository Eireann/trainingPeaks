requirejs(
[
    "jquery",
    "app",
    "TP",
    "underscore",
    "utilities/data/peaksGenerator"
],
function($, theMarsApp, TP, _, ThePeaksGenerator)
{
    describe("peaksGenarator", function ()
    {
        it("Should format into readable labels", function ()
        {
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM5Seconds")).toEqual("5 Seconds");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM2Minutes")).toEqual("2 Minutes");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM1Hour")).toEqual("60 Minutes");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM1Minute")).toEqual("60 Seconds");
        });

        it("Should trow an exception if metric type is invalid", function ()
        {
            var initializeWrongMetric = function ()
            {
                ThePeaksGenerator._initializePeakDataOnModel("wrong metric", new TP.Model());
            };

            expect(initializeWrongMetric).toThrow("ThePeaksGenerator: wrong metric is an invalid metric");
        });

        it("Should not trow an exception if metric type is valid", function ()
        {
            var initializeMetric = function ()
            {
                ThePeaksGenerator._initializePeakDataOnModel("Cadence", new TP.Model());
                ThePeaksGenerator._initializePeakDataOnModel("HeartRate", new TP.Model());
                ThePeaksGenerator._initializePeakDataOnModel("Power", new TP.Model());
                ThePeaksGenerator._initializePeakDataOnModel("Speed", new TP.Model());
            };

            expect(initializeMetric).not.toThrow();
        });

        it("Model should have meanMax metrics", function ()
        {
            var tpModel = new TP.Model();
            ThePeaksGenerator._initializePeakDataOnModel("Speed", tpModel);
            expect(tpModel.has("meanMaxSpeeds")).toBeTruthy();
            expect(_.isArray(tpModel.get("meanMaxSpeeds.meanMaxes"))).toBeTruthy();
            expect(tpModel.get("meanMaxSpeeds.id")).toEqual(0);
        });

        it("Should create meanMax metrics from tier 3 data", function()
        {
            var tpModel = new TP.Model({
                flatSamples: true,
                peakHeartRates: [
                    {
                        begin: 2195000,
                        end: 2200000,
                        interval: 2,
                        value: 231
                    },
                    {
                        begin: 2195000,
                        end: 2200000,
                        interval: 5,
                        value: 231
                    },
                    {
                        begin: 3220000,
                        end: 3230000,
                        interval: 10,
                        value: 231
                    }
                ]
            });

            ThePeaksGenerator._initializePeakDataOnModel("HeartRate", tpModel);
            expect(tpModel.has("meanMaxHeartRates")).toBeTruthy();
            expect(_.isArray(tpModel.get("meanMaxHeartRates.meanMaxes"))).toBeTruthy();

            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[0].label).toEqual("2 Seconds");
            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[0].value).toEqual(231);

            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[1].label).toEqual("5 Seconds");
            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[1].value).toEqual(231);
        });

        it("Should have meanMaxes in the model", function ()
        {
            var tpModel = new TP.Model();
            ThePeaksGenerator._initializePeakDataOnModel("Speed", tpModel);
            expect(_.find(tpModel.get("meanMaxSpeeds.meanMaxes"), function (meanMax)
            {
                return meanMax.label === "MM5Seconds";
            })).not.toBeNull();

            expect(_.find(tpModel.get("meanMaxSpeeds.meanMaxes"), function (meanMax)
            {
                return meanMax.label === "MM90Minutes";
            })).not.toBeNull();
        });

    });

});
           