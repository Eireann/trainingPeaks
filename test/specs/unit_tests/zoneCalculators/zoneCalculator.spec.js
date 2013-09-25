requirejs(
[
    "jquery",
    "testUtils/xhrDataStubs",
    "testUtils/testHelpers",
    "TP",
    "app",
    "shared/utilities/zoneCalculator"
],
function (
    $,
    xhrData,
    testHelpers,
    TP,
    theMarsApp,
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
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(deferred);
                heartRateZonesCalculator.calculate(heartRateZonesModel);

                deferred.done(function()
                {
                    success = true;
                });

                deferred.resolveWith(deferred, [{zones: []}]);
                expect(success).toBe(true);
            });

            it("Should fail if the api returns null", function()
            {
                var failed = false;
                var ajaxDeferred = new $.Deferred();
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(ajaxDeferred);
                var calculatorDeferred = heartRateZonesCalculator.calculate(heartRateZonesModel);

                calculatorDeferred.fail(function()
                {
                    failed = true;
                });

                ajaxDeferred.resolveWith(ajaxDeferred, [ null ]);

                expect(failed).toBe(true);
            });

            it("Should fail if the api fails", function()
            {
                var failed = false;
                var ajaxDeferred = new $.Deferred();
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(ajaxDeferred);
                var calculatorDeferred = heartRateZonesCalculator.calculate(heartRateZonesModel);

                calculatorDeferred.fail(function()
                {
                    failed = true;
                });

                ajaxDeferred.reject();
                expect(failed).toBe(true);
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
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(new $.Deferred());
                heartRateZonesCalculator.calculate(heartRateZonesModel);
                expect(heartRateZonesCalculator._ajax).toHaveBeenCalled();
                var options = heartRateZonesCalculator._ajax.calls[0].args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/heartrate");
                expect(expectedUrl.test(options.url)).toBe(true);
            });

            it("Should pass the correct parameters", function()
            {
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(new $.Deferred());
                heartRateZonesModel.set("threshold", 150);
                heartRateZonesModel.set("maximumHeartRate", 200);
                heartRateZonesModel.set("restingHeartRate", 50);

                heartRateZonesCalculator.calculate(heartRateZonesModel);
                expect(heartRateZonesCalculator._ajax).toHaveBeenCalled();
                var postData = heartRateZonesCalculator._ajax.calls[0].args[0].data;

                expect(postData.LTHR).toBe(150);
                expect(postData.maxHR).toBe(200);
                expect(postData.restingHR).toBe(50);
                expect(postData.zoneType).toBe(1);

            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                spyOn(heartRateZonesCalculator, "_ajax").andReturn(ajaxDeferred);
                heartRateZonesCalculator.calculate(heartRateZonesModel);

                var serverResponse = {
                    lactateThreshold: 162,
                    maxHR: 198,
                    restingHR: 42,
                    zones: [{}, {}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(heartRateZonesModel.get("threshold")).toBe(162);
                expect(heartRateZonesModel.get("maximumHeartRate")).toBe(198);
                expect(heartRateZonesModel.get("restingHeartRate")).toBe(42);
                expect(heartRateZonesModel.get("zones").length).toBe(2);
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
                spyOn(powerZonesCalculator, "_ajax").andReturn(new $.Deferred());
                powerZonesCalculator.calculate(powerZonesModel);
                expect(powerZonesCalculator._ajax).toHaveBeenCalled();
                var options = powerZonesCalculator._ajax.calls[0].args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/power");
                expect(expectedUrl.test(options.url)).toBe(true);
            });

            it("Should pass the correct parameters", function()
            {
                spyOn(powerZonesCalculator, "_ajax").andReturn(new $.Deferred());
                powerZonesModel.set("threshold", 250);

                powerZonesCalculator.calculate(powerZonesModel);
                expect(powerZonesCalculator._ajax).toHaveBeenCalled();
                var postData = powerZonesCalculator._ajax.calls[0].args[0].data;

                expect(postData.LTPower).toBe(250);
                expect(postData.zoneType).toBe(11);
            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                spyOn(powerZonesCalculator, "_ajax").andReturn(ajaxDeferred);
                powerZonesCalculator.calculate(powerZonesModel);

                var serverResponse = {
                    lactateThreshold: 199,
                    zones: [{}, {}, {}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(powerZonesModel.get("threshold")).toBe(199);
                expect(powerZonesModel.get("zones").length).toBe(3);
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
                spyOn(speedZonesCalculator, "_ajax").andReturn(new $.Deferred());
                speedZonesCalculator.calculate(speedZonesModel);
                expect(speedZonesCalculator._ajax).toHaveBeenCalled();
                var options = speedZonesCalculator._ajax.calls[0].args[0];
                var expectedUrl = new RegExp("/zonescalculator/v1/speed");
                expect(expectedUrl.test(options.url)).toBe(true);
            });

            it("Should pass the correct parameters", function()
            {
                spyOn(speedZonesCalculator, "_ajax").andReturn(new $.Deferred());
                speedZonesModel.set("threshold", 5);
                speedZonesModel.set("testDistance", 3);

                speedZonesCalculator.calculate(speedZonesModel);
                expect(speedZonesCalculator._ajax).toHaveBeenCalled();
                var postData = speedZonesCalculator._ajax.calls[0].args[0].data;

                expect(postData.speed).toBe(5);
                expect(postData.distance).toBe(3);
                expect(postData.zoneType).toBe(13);
            });

            it("Should set the appropriate values on the model", function()
            {
                var ajaxDeferred = new $.Deferred();
                spyOn(speedZonesCalculator, "_ajax").andReturn(ajaxDeferred);
                speedZonesCalculator.calculate(speedZonesModel);

                var serverResponse = {
                    thresholdSpeed: 4.62,
                    zones: [{}]
                };

                ajaxDeferred.resolveWith(ajaxDeferred, [ serverResponse ]);

                expect(speedZonesModel.get("threshold")).toBe(4.62);
                expect(speedZonesModel.get("zones").length).toBe(1);
            });

        });

    });

});