define(
[
    "jquery",
    "TP",
    "underscore",
    "utilities/data/peaksGenerator"
],
function($, TP, _, ThePeaksGenerator)
{
    describe("peaksGenarator", function ()
    {
        it("Should format into readable labels", function ()
        {
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM5Seconds")).to.eql("5 Seconds");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM2Minutes")).to.eql("2 Minutes");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM1Hour")).to.eql("60 Minutes");
            expect(ThePeaksGenerator._formatMeanMaxLabel("MM1Minute")).to.eql("60 Seconds");
        });

        it("Should trow an exception if metric type is invalid", function ()
        {
            var initializeWrongMetric = function ()
            {
                ThePeaksGenerator._initializePeakDataOnModel("wrong metric", new TP.Model());
            };

            expect(initializeWrongMetric).to.throw("ThePeaksGenerator: wrong metric is an invalid metric");
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

            expect(initializeMetric).to.not.throw();
        });

        it("Model should have meanMax metrics", function ()
        {
            var tpModel = new TP.Model();
            ThePeaksGenerator._initializePeakDataOnModel("Speed", tpModel);
            expect(tpModel.has("meanMaxSpeeds")).to.be.ok;
            expect(_.isArray(tpModel.get("meanMaxSpeeds.meanMaxes"))).to.be.ok;
            expect(tpModel.get("meanMaxSpeeds.id")).to.eql(0);
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
            expect(tpModel.has("meanMaxHeartRates")).to.be.ok;
            expect(_.isArray(tpModel.get("meanMaxHeartRates.meanMaxes"))).to.be.ok;

            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[0].label).to.eql("2 Seconds");
            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[0].value).to.eql(231);

            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[1].label).to.eql("5 Seconds");
            expect(tpModel.get("meanMaxHeartRates.meanMaxes")[1].value).to.eql(231);
        });

        it("Should have meanMaxes in the model", function ()
        {
            var tpModel = new TP.Model();
            ThePeaksGenerator._initializePeakDataOnModel("Speed", tpModel);
            expect(_.find(tpModel.get("meanMaxSpeeds.meanMaxes"), function (meanMax)
            {
                return meanMax.label === "MM5Seconds";
            })).to.not.be.null;

            expect(_.find(tpModel.get("meanMaxSpeeds.meanMaxes"), function (meanMax)
            {
                return meanMax.label === "MM90Minutes";
            })).to.not.be.null;
        });

    });

});
           
