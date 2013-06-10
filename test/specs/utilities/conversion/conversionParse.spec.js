requirejs(
[
    "app",
    "TP",
    "utilities/conversion/conversion",
    "utilities/conversion/convertToModelUnits",
    "utilities/datetime/datetime"
],
function(theMarsApp, TP, conversion, convertToModelUnits, dateTimeUtils)
{

    var describeParse = function(methodName, testValues)
    {
        _.each(testValues, function(testValue)
        {
            it("conversion." + methodName + "(" + testValue.input + ") Should return " + testValue.output, function()
            {
                expect(conversion[methodName](testValue.input, testValue.options)).toEqual(testValue.output);
            });
        });

    };

    describe("Conversion Input Parsing", function()
    {
        describe("DateTime seconds", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("Should allow decimal seconds input", function()
            {
                expect(dateTimeUtils.convert.timeToDecimalHours("99:59:59.99")).toEqual(99 + (59 / 60) + (59.99 / 3600));
            });

            it("Should format decimal seconds output if there is a decimal value", function()
            {
                expect(dateTimeUtils.format.decimalHoursAsTime(99 + (59 / 60) + (59.99 / 3600))).toEqual("99:59:59.99");
            });

            it("Should not format decimal seconds output if there is not a decimal value", function()
            {
                expect(dateTimeUtils.format.decimalHoursAsTime(99 + (59 / 60) + (59 / 3600))).toEqual("99:59:59");
            });

            it("Should not format decimal seconds output if the showDecimalSeconds parameter is false", function()
            {
                expect(dateTimeUtils.format.decimalHoursAsTime(98 + (59 / 60) + (59.99 / 3600), true, "00:00:00", false)).toEqual("99:00:00");
                expect(dateTimeUtils.format.decimalHoursAsTime(98 + (59 / 60) + (59.33 / 3600), true, "00:00:00", false)).toEqual("98:59:59");
            });

        });

        describe("Duration", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeParse("parseDuration", [
                {
                    input: "-1:00:00",
                    output: 0
                },
                {
                    input: "00:00:01",
                    output: 1 / 3600
                },
                {
                    input: "99:59:59.99",
                    output: 99 + (59 / 60) + (59 / 3600)
                },
                {
                    input: "99:59:59",
                    output: 99 + (59 / 60) + (59 / 3600)
                },
                {
                    input: "::59.99",
                    output: (59.99 / 3600)
                },
                {
                    input: "::0.99",
                    output: (0.99 / 3600)
                }
            ]);
        });

        describe("Distance", function()
        {

            describeParse("parseDistance", [
                {
                    input: "999999",
                    output: convertToModelUnits(999999, "distance")
                },
                {
                    input: "1000000",
                    output: convertToModelUnits(999999, "distance")
                },
                {
                    input: "1",
                    output: convertToModelUnits(1, "distance")
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Speed", function()
        {
            describeParse("parseSpeed", [
                {
                    input: "999",
                    output: convertToModelUnits("999", "speed")
                },
                {
                    input: "999.1",
                    output: convertToModelUnits("999", "speed")
                },
                {
                    input: "1000",
                    output: convertToModelUnits("999", "speed")
                },
                {
                    input: "1",
                    output: convertToModelUnits("1", "speed")
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Pace", function()
        {

            describeParse("parsePace", [
                {
                    input: "00:00:00",
                    output: convertToModelUnits("00:00:01", "pace")
                },
                {
                    input: "00:00:01",
                    output: convertToModelUnits("00:00:01", "pace")
                },
                {
                    input: "99:59",
                    output: convertToModelUnits("00:99:59", "pace")
                },
                {
                    input: "99:59:59",
                    output: convertToModelUnits("99:59:59", "pace")
                },
                {
                    input: "99:59:59.99",
                    output: convertToModelUnits("99:59:59.99", "pace")
                },
                {
                    input: "::59.99",
                    output: convertToModelUnits("::59.99", "pace")
                },
                {
                    input: "::0.99",
                    output: convertToModelUnits("0:0:01", "pace")
                },
                {
                    input: "100:00:00",
                    output: convertToModelUnits("99:59:59.99", "pace")
                }
            ]);
        });

        describe("Calories", function()
        {
            describeParse("parseCalories", [
                {
                    input: "99999",
                    output: 99999 
                },
                {
                    input: "99999.1",
                    output: 99999
                },
                {
                    input: "100000",
                    output: 99999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Elevation Gain", function()
        {
            describeParse("parseElevationGain", [
                {
                    input: "99999",
                    output: 99999 
                },
                {
                    input: "99999.1",
                    output: 99999
                },
                {
                    input: "100000",
                    output: 99999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Elevation Loss", function()
        {
            describeParse("parseElevationLoss", [
                {
                    input: "99999",
                    output: 99999 
                },
                {
                    input: "99999.1",
                    output: 99999
                },
                {
                    input: "100000",
                    output: 99999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Elevation", function()
        {
            describeParse("parseElevation", [
                {
                    input: "99999",
                    output: 99999 
                },
                {
                    input: "99999.1",
                    output: 99999
                },
                {
                    input: "100000",
                    output: 99999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: -1 
                },
                {
                    input: "-15001",
                    output: -15000
                }
            ]);
        });

        describe("Energy", function()
        {
            describeParse("parseEnergy", [
                {
                    input: "99999",
                    output: 99999 
                },
                {
                    input: "99999.1",
                    output: 99999
                },
                {
                    input: "100000",
                    output: 99999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("TSS", function()
        {
            describeParse("parseTSS", [
                {
                    input: "9999",
                    output: 9999
                },
                {
                    input: "9999.1",
                    output: 9999
                },
                {
                    input: "999.1",
                    output: 999.1
                },
                {
                    input: "10000",
                    output: 9999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "0.23",
                    output: 0.2
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("IF", function()
        {
            describeParse("parseIF", [
                {
                    input: "99",
                    output: 99
                },
                {
                    input: "99.1",
                    output: 99
                },
                {
                    input: "9.13",
                    output: 9.13
                },
                {
                    input: "100",
                    output: 99
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "0.234",
                    output: 0.23
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Power", function()
        {
            describeParse("parsePower", [
                {
                    input: "9999",
                    output: 9999 
                },
                {
                    input: "9999.1",
                    output: 9999
                },
                {
                    input: "10000",
                    output: 9999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: 0,
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("HeartRate", function()
        {
            describeParse("parseHeartRate", [
                {
                    input: "255",
                    output: 255 
                },
                {
                    input: "255.1",
                    output: 255
                },
                {
                    input: "10000",
                    output: 255
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: 0,
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Cadence", function()
        {
            describeParse("parseCadence", [
                {
                    input: "255",
                    output: 255 
                },
                {
                    input: "255.1",
                    output: 255
                },
                {
                    input: "10000",
                    output: 255
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: 0,
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                }
            ]);
        });

        describe("Torque", function()
        {
            describeParse("parseTorque", [
                {
                    input: "9999",
                    output: 9999 
                },
                {
                    input: "9999.1",
                    output: 9999
                },
                {
                    input: "10000",
                    output: 9999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: "0",
                    output: 0
                },
                {
                    input: "-1",
                    output: 0
                },
                {
                    input: "1.23",
                    output: 1.23
                }
            ]);
        });

        describe("Temperature", function()
        {
            describeParse("parseTemperature", [
                {
                    input: "999",
                    output: 999 
                },
                {
                    input: "999.1",
                    output: 999
                },
                {
                    input: "1000",
                    output: 999
                },
                {
                    input: "1",
                    output: 1
                },
                {
                    input: 0,
                    output: 0
                },
                {
                    input: "-1",
                    output: -1
                },
                {
                    input: "-999",
                    output: -999
                },
                {
                    input: "-1000",
                    output: -999
                }
            ]);
        });





    });

});