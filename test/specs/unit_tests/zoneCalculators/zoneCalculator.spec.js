define(
[
    "jquery",
    "testUtils/xhrDataStubs",
    "testUtils/testHelpers",
    "TP",
    "shared/utilities/zoneCalculator"
],
function (
    $,
    xhrData,
    testHelpers,
    TP,
    ZoneCalculator
         )
{
    describe("Zone Calculator", function()
    {

        describe("Base", function()
        {
            var heartRateZonesModel;
            var heartRateZonesCalculator;

            var heartRateZoneCalculatorDefinition = { id: 1 };

            beforeEach(function()
            {
                heartRateZonesModel = new TP.Model();
                heartRateZonesCalculator = new ZoneCalculator.HeartRate(heartRateZoneCalculatorDefinition);
            });

            it("Should resolve if the api succeeds", function()
            {
                var success = false;
                var deferred = new $.Deferred();
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(deferred);
                heartRateZonesCalculator.calculate(heartRateZonesModel);

                deferred.done(function()
                {
                    success = true;
                });

                deferred.resolveWith(deferred, [{zones: []}]);
                expect(success).to.equal(true);
            });

            it("Should fail if the api returns null", function()
            {
                var failed = false;
                var ajaxDeferred = new $.Deferred();
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(ajaxDeferred);
                var calculatorDeferred = heartRateZonesCalculator.calculate(heartRateZonesModel);

                calculatorDeferred.fail(function()
                {
                    failed = true;
                });

                ajaxDeferred.resolveWith(ajaxDeferred, [ null ]);

                expect(failed).to.equal(true);
            });

            it("Should fail if the api fails", function()
            {
                var failed = false;
                var ajaxDeferred = new $.Deferred();
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(ajaxDeferred);
                var calculatorDeferred = heartRateZonesCalculator.calculate(heartRateZonesModel);

                calculatorDeferred.fail(function()
                {
                    failed = true;
                });

                ajaxDeferred.reject();
                expect(failed).to.equal(true);
            });

        });

        describe("HeartRate", function()
        {
            var heartRateZonesModel;
            var heartRateZonesCalculator;

            var heartRateZoneCalculatorDefinition = { id: 1 };

            beforeEach(function()
            {
                heartRateZonesModel = new TP.Model(
                    {
                        threshold: 0,
                        maximumHeartRate: 0,
                        restingHeartRate: 0
                    }
                );

                heartRateZonesCalculator = new ZoneCalculator.HeartRate(heartRateZoneCalculatorDefinition);
            });

            it("Should call the correct endpoint", function()
            {
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(new $.Deferred());
                heartRateZonesCalculator.calculate(heartRateZonesModel);
                expect(heartRateZonesCalculator._ajax).to.have.been.called;
                var options = heartRateZonesCalculator._ajax.getCall(0).args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/heartrate");
                expect(expectedUrl.test(options.url)).to.equal(true);
            });

            it("Should pass the correct parameters", function()
            {
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(new $.Deferred());
                heartRateZonesModel.set("threshold", 150);
                heartRateZonesModel.set("maximumHeartRate", 200);
                heartRateZonesModel.set("restingHeartRate", 50);

                heartRateZonesCalculator.calculate(heartRateZonesModel);
                expect(heartRateZonesCalculator._ajax).to.have.been.called;
                var postData = heartRateZonesCalculator._ajax.getCall(0).args[0].data;

                expect(postData.LTHR).to.equal(150);
                expect(postData.maxHR).to.equal(200);
                expect(postData.restingHR).to.equal(50);
                expect(postData.zoneType).to.equal(1);

            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                sinon.stub(heartRateZonesCalculator, "_ajax").returns(ajaxDeferred);
                heartRateZonesCalculator.calculate(heartRateZonesModel);

                var serverResponse = {
                    lactateThreshold: 162,
                    maxHR: 198,
                    restingHR: 42,
                    zones: [{}, {}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(heartRateZonesModel.get("threshold")).to.equal(162);
                expect(heartRateZonesModel.get("maximumHeartRate")).to.equal(198);
                expect(heartRateZonesModel.get("restingHeartRate")).to.equal(42);
                expect(heartRateZonesModel.get("zones").length).to.equal(2);
            });

        });

        describe("Power", function()
        {
            var powerZonesModel;
            var powerZonesCalculator;

            var powerZoneCalculatorDefinition = { id: 11 };

            beforeEach(function()
            {
                powerZonesModel = new TP.Model(
                    {
                        threshold: 0
                    }
                );

                powerZonesCalculator = new ZoneCalculator.Power(powerZoneCalculatorDefinition);
            });

            it("Should call the correct endpoint", function()
            {
                sinon.stub(powerZonesCalculator, "_ajax").returns(new $.Deferred());
                powerZonesCalculator.calculate(powerZonesModel);
                expect(powerZonesCalculator._ajax).to.have.been.called;
                var options = powerZonesCalculator._ajax.getCall(0).args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/power");
                expect(expectedUrl.test(options.url)).to.equal(true);
            });

            it("Should pass the correct parameters", function()
            {
                sinon.stub(powerZonesCalculator, "_ajax").returns(new $.Deferred());
                powerZonesModel.set("threshold", 250);

                powerZonesCalculator.calculate(powerZonesModel);
                expect(powerZonesCalculator._ajax).to.have.been.called;
                var postData = powerZonesCalculator._ajax.getCall(0).args[0].data;

                expect(postData.LTPower).to.equal(250);
                expect(postData.zoneType).to.equal(11);
            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                sinon.stub(powerZonesCalculator, "_ajax").returns(ajaxDeferred);
                powerZonesCalculator.calculate(powerZonesModel);

                var serverResponse = {
                    lactateThreshold: 199,
                    zones: [{}, {}, {}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(powerZonesModel.get("threshold")).to.equal(199);
                expect(powerZonesModel.get("zones").length).to.equal(3);
            });

        });

        describe("Speed", function()
        {
            var speedZonesModel;
            var speedZonesCalculator;

            var speedZoneCalculatorDefinition = { id: 13 };

            beforeEach(function()
            {
                speedZonesModel = new TP.Model(
                    {
                        threshold: 0
                    }
                );

                speedZonesCalculator = new ZoneCalculator.Speed(speedZoneCalculatorDefinition);
            });

            it("Should call the correct endpoint", function()
            {
                sinon.stub(speedZonesCalculator, "_ajax").returns(new $.Deferred());
                speedZonesCalculator.calculate(speedZonesModel);
                expect(speedZonesCalculator._ajax).to.have.been.called;
                var options = speedZonesCalculator._ajax.getCall(0).args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/speed");
                expect(expectedUrl.test(options.url)).to.equal(true);
            });

            it("Should pass the correct parameters", function()
            {
                sinon.stub(speedZonesCalculator, "_ajax").returns(new $.Deferred());
                speedZonesModel.set("threshold", 5);
                speedZonesModel.set("testDistance", 3);

                speedZonesCalculator.calculate(speedZonesModel);
                expect(speedZonesCalculator._ajax).to.have.been.called;
                var postData = speedZonesCalculator._ajax.getCall(0).args[0].data;

                expect(postData.speed).to.equal(5);
                expect(postData.distance).to.equal(3);
                expect(postData.zoneType).to.equal(13);
            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                sinon.stub(speedZonesCalculator, "_ajax").returns(ajaxDeferred);
                speedZonesCalculator.calculate(speedZonesModel);

                var serverResponse = {
                    thresholdSpeed: 4.62,
                    zones: [{}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(speedZonesModel.get("threshold")).to.equal(4.62);
                expect(speedZonesModel.get("zones").length).to.equal(1);
            });

        });

    });

});
