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

    var describeFormat = function(methodName, testValues)
    {
        _.each(testValues, function(testValue)
        {
            it("conversion." + methodName + "(" + testValue.input + ") Should return " + testValue.output, function()
            {
                expect(conversion[methodName](testValue.input, testValue.options)).toEqual(testValue.output);
            });
        });

    };

    describe("Conversion Output Formatting", function()
    {
        xdescribe("Duration", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatDuration", [
                {
                    output: "-1:00:00",
                    input: 0
                },
                {
                    output: "00:00:01",
                    input: 1 / 3600
                },
                {
                    output: "99:59:59",
                    input: 99 + (59 / 60) + (59 / 3600)
                },
                {
                    output: "99:59:59.99",
                    input: 99 + (59 / 60) + (59.99 / 3600)
                },
                {
                    output: "::59.99",
                    input: (59.99 / 3600)
                },
                {
                    output: "::0.99",
                    input: (0.99 / 3600)
                }
            ]);
        });


        xdescribe("Distance", function()
        {

            describeFormat("formatDistance", [
                {
                    output: "999999",
                    input: convertToModelUnits(999999, "distance")
                },
                {
                    output: "1000000",
                    input: convertToModelUnits(999999, "distance")
                },
                {
                    output: "1",
                    input: convertToModelUnits(1, "distance")
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Speed", function()
        {
            describeFormat("formatSpeed", [
                {
                    output: "999",
                    input: convertToModelUnits("999", "speed")
                },
                {
                    output: "999.1",
                    input: convertToModelUnits("999", "speed")
                },
                {
                    output: "1000",
                    input: convertToModelUnits("999", "speed")
                },
                {
                    output: "1",
                    input: convertToModelUnits("1", "speed")
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Pace", function()
        {

            describeFormat("formatPace", [
                {
                    output: "00:00:00",
                    input: convertToModelUnits("00:99:59", "pace")
                },
                {
                    output: "00:00:01",
                    input: convertToModelUnits("00:00:01", "pace")
                },
                {
                    output: "99:59",
                    input: convertToModelUnits("00:99:59", "pace")
                },
                {
                    output: "99:59:59",
                    input: convertToModelUnits("99:59:59", "pace")
                },
                {
                    output: "99:59:59.99",
                    input: convertToModelUnits("99:59:59.99", "pace")
                },
                {
                    output: "::59.99",
                    input: convertToModelUnits("::59.99", "pace")
                },
                {
                    output: "::0.99",
                    input: convertToModelUnits("::0.99", "pace")
                },
                {
                    output: "100:00:00",
                    input: convertToModelUnits("99:59:59.99", "pace")
                }
            ]);
        });

        xdescribe("Calories", function()
        {
            describeFormat("formatCalories", [
                {
                    output: "99999",
                    input: 99999 
                },
                {
                    output: "99999.1",
                    input: 99999
                },
                {
                    output: "100000",
                    input: 99999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Elevation Gain", function()
        {
            describeFormat("formatElevationGain", [
                {
                    output: "99999",
                    input: 99999 
                },
                {
                    output: "99999.1",
                    input: 99999
                },
                {
                    output: "100000",
                    input: 99999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Elevation Loss", function()
        {
            describeFormat("formatElevationLoss", [
                {
                    output: "99999",
                    input: 99999 
                },
                {
                    output: "99999.1",
                    input: 99999
                },
                {
                    output: "100000",
                    input: 99999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Elevation", function()
        {
            describeFormat("formatElevation", [
                {
                    output: "99999",
                    input: 99999 
                },
                {
                    output: "99999.1",
                    input: 99999
                },
                {
                    output: "100000",
                    input: 99999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: -1 
                },
                {
                    output: "-15001",
                    input: -15000
                }
            ]);
        });

        xdescribe("Energy", function()
        {
            describeFormat("formatEnergy", [
                {
                    output: "99999",
                    input: 99999 
                },
                {
                    output: "99999.1",
                    input: 99999
                },
                {
                    output: "100000",
                    input: 99999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("TSS", function()
        {
            describeFormat("formatTSS", [
                {
                    output: "9999",
                    input: 9999
                },
                {
                    output: "9999.1",
                    input: 9999
                },
                {
                    output: "999.1",
                    input: 999.1
                },
                {
                    output: "10000",
                    input: 9999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "0.23",
                    input: 0.2
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("IF", function()
        {
            describeFormat("formatIF", [
                {
                    output: "99",
                    input: 99
                },
                {
                    output: "99.1",
                    input: 99
                },
                {
                    output: "9.13",
                    input: 9.13
                },
                {
                    output: "100",
                    input: 99
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: "0",
                    input: 0
                },
                {
                    output: "0.234",
                    input: 0.23
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        xdescribe("Power", function()
        {
            describeFormat("formatPower", [
                {
                    output: "9999",
                    input: 9999 
                },
                {
                    output: "9999.1",
                    input: 9999
                },
                {
                    output: "10000",
                    input: 9999
                },
                {
                    output: "1",
                    input: 1
                },
                {
                    output: 0,
                    input: 0
                },
                {
                    output: "-1",
                    input: 0
                }
            ]);
        });

        describe("HeartRate", function()
        {
            describeFormat("formatHeartRate", [
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
                    output: "",
                    input: 0
                },
                {
                    input: "-1",
                    output: ""
                }
            ]);
        });

        describe("Cadence", function()
        {
            describeFormat("formatCadence", [
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
                    output: 1,
                    input: 1
                },
                {
                    output: "",
                    input: 0
                },
                {
                    output: "",
                    input: -1
                }
            ]);
        });

        describe("Torque", function()
        {
            describeFormat("formatTorque", [
                {
                    output: 9999,
                    input: 9999 
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
                    output: "" 
                },
                {
                    input: "-1",
                    output: ""
                },
                {
                    input: "1.234",
                    output: 1.23
                }
            ]);
        });

        describe("Temperature", function()
        {
            describeFormat("formatTemperature", [
                {
                    output: 999,
                    input: 999 
                },
                {
                    output: 999,
                    input: 999.1
                },
                {
                    output: 999,
                    input: 1000
                },
                {
                    output: 1,
                    input: 1
                },
                {
                    output: "",
                    input: 0
                },
                {
                    output: -1,
                    input: -1
                },
                {
                    output: -999,
                    input: -999
                },
                {
                    output: -999,
                    input: -1000
                }
            ]);
        });





    });

});