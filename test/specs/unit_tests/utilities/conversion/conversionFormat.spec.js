define(
[
    "testUtils/testHelpers",
    "TP",
    "utilities/conversion/conversion",
    "utilities/conversion/convertToModelUnits",
    "utilities/datetime/datetime"
],
function(testHelpers, TP, conversion, convertToModelUnits, dateTimeUtils)
{

    var describeFormat = function(methodName, testValues)
    {
        _.each(testValues, function(testValue)
        {
            it("conversion." + methodName + "(" + testValue.input + ") Should return " + testValue.output, function()
            {
                expect(conversion[methodName](testValue.input, testValue.options)).to.eql(testValue.output);
            });
        });

    };

    describe("Conversion Output Formatting", function()
    {
        describe("Duration", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatDuration", [
                {
                    input: -1,
                    output: "0:00:00"
                },
                {
                    output: "0:00:01",
                    input: 1 / 3600
                },
                {
                    output: "99:59:59",
                    input: 99 + (59 / 60) + (59 / 3600)
                },
                {
                    output: "99:59:59",
                    input: 99 + (59 / 60) + (59.99 / 3600)
                },
                {
                    output: "0:01:00",
                    input: (59.99 / 3600)
                },
                {
                    output: "0:00:01",
                    input: (0.99 / 3600)
                }
            ]);
        });


        describe("Distance", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatDistance", [
                {
                    output: "999999",
                    input: convertToModelUnits(999999, "distance")
                },
                {
                    output: "999999",
                    input: convertToModelUnits(10000000, "distance")
                },
                {
                    output: "1.00",
                    input: convertToModelUnits(1, "distance")
                },
                {
                    output: "",
                    input: 0
                },
                {
                    output: "",
                    input: -1
                },
                {
                    output: "99.9",
                    input: convertToModelUnits(99.88888, "distance")
                },
                {
                    output: "9.99",
                    input: convertToModelUnits(9.988888, "distance")
                }
            ]);
        });

        describe("Speed", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatSpeed", [
                {
                    output: "999",
                    input: convertToModelUnits("999", "speed")
                },
                {
                    output: "999",
                    input: convertToModelUnits("999.1", "speed")
                },
                {
                    output: "999",
                    input: convertToModelUnits("1000", "speed")
                },
                {
                    output: "1.00",
                    input: convertToModelUnits("1", "speed")
                },
                {
                    output: "",
                    input: 0
                },
                {
                    output: "",
                    input: 0
                },
                {
                    output: "99.9",
                    input: convertToModelUnits(99.88888, "speed")
                },
                {
                    output: "9.99",
                    input: convertToModelUnits(9.988888, "speed")
                }
            ]);
        });

        describe("Pace, as metric user", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatPace", [
                {
                    output: "1:39:59",
                    input: conversion.parsePace("00:99:59")
                },
                {
                    output: "00:01",
                    input: conversion.parsePace("00:00:01")
                },
                {
                    output: "99:59:59",
                    input: conversion.parsePace("99:59:59")
                },
                {
                    output: "99:59:58",
                    input: conversion.parsePace("99:59:58")
                },
                {
                    output: "99:59:59",
                    input: conversion.parsePace("99:59:59.99")
                },
                {
                    output: "01:00",
                    input: conversion.parsePace("::59.99")
                },
                {
                    output: "00:01",
                    input: conversion.parsePace("::0.99")
                },
                {
                    output: "99:59:59",
                    input: conversion.parsePace("100:00:00")
                }
            ]);
        });

        describe("Calories", function()
        {

            describeFormat("formatCalories", [
                {
                    input: "99999",
                    output: "99999"
                },
                {
                    input: "99999.1",
                    output: "99999"
                },
                {
                    input: "100000",
                    output: "99999"
                },
                {
                    input: "1",
                    output: "1"
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
                    input: "12.4",
                    output: "12"
                },
                {
                    input: "12.5",
                    output: "13"
                }
            ]);
        });

        describe("Elevation Gain", function()
        {
            describeFormat("formatElevationGain", [
                {
                    input: "99999",
                    output: "99999"
                },
                {
                    input: "99999.1",
                    output: "99999"
                },
                {
                    input: "100000",
                    output: "99999"
                },
                {
                    input: "1",
                    output: "1"
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
                    input: "1.23",
                    output: "1"
                }
            ]);
        });

        describe("Elevation Loss", function()
        {
            describeFormat("formatElevationLoss", [
                {
                    input: "99999",
                    output: "99999"
                },
                {
                    input: "99999.1",
                    output: "99999"
                },
                {
                    input: "100000",
                    output: "99999"
                },
                {
                    input: "1",
                    output: "1"
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
                    input: "23.45",
                    output: "23"
                }
            ]);
        });

        describe("Elevation", function()
        {
            describeFormat("formatElevation", [
                {
                    input: "99999",
                    output: "99999"
                },
                {
                    input: "99999.1",
                    output: "99999"
                },
                {
                    input: "100000",
                    output: "99999"
                },
                {
                    input: "1",
                    output: "1"
                },
                {
                    input: "0",
                    output: "0"
                },
                {
                    input: "-1",
                    output: "-1"
                },
                {
                    input: "-15001",
                    output: "-15000"
                },
                {
                    input: null,
                    output: ""
                }
            ]);
        });

        describe("Energy", function()
        {
            describeFormat("formatEnergy", [
                {
                    input: "99999",
                    output: "99999"
                },
                {
                    input: "99999.1",
                    output: "99999"
                },
                {
                    input: "100000",
                    output: "99999"
                },
                {
                    input: "1",
                    output: "1"
                },
                {
                    input: "0",
                    output: ""
                },
                {
                    input: "-1",
                    output: ""
                }
            ]);
        });

        describe("TSS", function()
        {
            describeFormat("formatTSS", [
                {
                    input: "9999",
                    output: "9999.0"
                },
                {
                    input: "9999.1",
                    output: "9999.0"
                },
                {
                    input: "999.1",
                    output: "999.1"
                },
                {
                    input: "10000",
                    output: "9999.0"
                },
                {
                    input: "1",
                    output: "1.0"
                },
                {
                    input: "0",
                    output: "0.0"
                },
                {
                    input: "0.23",
                    output: "0.2"
                },
                {
                    input: "-1",
                    output: "0.0"
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                },
                {
                    input: 0,
                    output: "0.0"
                }
            ]);
        });

        describe("IF", function()
        {
            describeFormat("formatIF", [
                {
                    input: "99",
                    output: "99.00"
                },
                {
                    input: "99.1",
                    output: "99.00"
                },
                {
                    input: "9.13",
                    output: "9.13"
                },
                {
                    input: "100",
                    output: "99.00"
                },
                {
                    input: "1",
                    output: "1.00"
                },
                {
                    input: "0",
                    output: ""
                },
                {
                    input: "0.234",
                    output: "0.23"
                },
                {
                    input: "-1",
                    output: ""
                }
            ]);
        });

        describe("Power", function()
        {
            describeFormat("formatPower", [
                {
                    input: "9999",
                    output: "9999"
                },
                {
                    input: "9999.1",
                    output: "9999"
                },
                {
                    input: "10000",
                    output: "9999"
                },
                {
                    input: "1",
                    output: "1"
                },
                {
                    output: "",
                    input: "0"
                },
                {
                    input: "-1",
                    output: ""
                }
            ]);
        });

        describe("HeartRate", function()
        {
            describeFormat("formatHeartRate", [
                {
                    input: "255",
                    output: "255"
                },
                {
                    input: "255.1",
                    output: "255"
                },
                {
                    input: "100.1",
                    output: "100"
                },
                {
                    input: "10000",
                    output: "255"
                },
                {
                    input: "1",
                    output: "1"
                },
                {
                    output: "",
                    input: "0"
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
                    output: "255"
                },
                {
                    input: "255.1",
                    output: "255"
                },
                {
                    input: "10000",
                    output: "255"
                },
                {
                    output: "1",
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

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatTorque", [
                {
                    output: "9999",
                    input: 9999
                },
                {
                    input: "9999.1",
                    output: "9999"
                },
                {
                    input: "10000",
                    output: "9999"
                },
                {
                    input: "1",
                    output: "1.00"
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
                    output: "1.23"
                },
                {
                    input: 12.36,
                    output: "12.4"
                }
            ]);
        });

        describe("Temperature", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatTemperature", [
                {
                    output: "999",
                    input: 999
                },
                {
                    output: "999",
                    input: 999.1
                },
                {
                    output: "999",
                    input: 1000
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
                    output: "-999",
                    input: -999
                },
                {
                    output: "-999",
                    input: -998.5
                },
                {
                    output: "-999",
                    input: -1000
                },
                {
                    input: null,
                    output: ""
                }
            ]);
        });

        describe("Efficiency Factor, for run and walk", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatEfficiencyFactor", [
                {
                    output: "1.00",
                    input: 1 / 60,
                    options: { workoutTypeId: 3 }
                },
                {
                    output: "4.32",
                    input: 4.315 / 60,
                    options: { workoutTypeId: 3 }
                },
                {
                    output: "0.00",
                    input: 0 / 60,
                    options: { workoutTypeId: 3 }
                },
                {
                    output: "3.20",
                    input: 3.2 / 60,
                    options: { workoutTypeId: 3 }
                }
            ]);
        });

        describe("Efficiency Factor, for other workout types", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatEfficiencyFactor", [
                {
                    output: "1.00",
                    input: 1,
                    options: { workoutTypeId: 1 }
                },
                {
                    output: "4.32",
                    input: 4.315,
                    options: { workoutTypeId: 1 }
                },
                {
                    output: "0.00",
                    input: 0,
                    options: { workoutTypeId: 1 }
                },
                {
                    output: "3.20",
                    input: 3.2,
                    options: { workoutTypeId: 1 }
                }
            ]);
        });

        describe("Weight", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            describeFormat("formatWeight", [
                {
                    input: 120.34,
                    output: "120.3"
                },
                {
                    input: 33,
                    output: "33.0"
                }
            ]);
        });
    });

});
