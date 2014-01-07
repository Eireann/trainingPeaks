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

    var describeFormatUnits = function(units, testValues, options)
    {
        _.each(testValues, function(testValue)
        {
            it("conversion.formatUnitsValue(" + units + ", " + testValue.input + ") Should return " + testValue.output, function()
            {
                var formatOptions =  _.defaults({}, testValue.options, options);
                expect(conversion.formatUnitsValue(units, testValue.input, formatOptions)).to.be.eql(testValue.output);
            });
        });

    };

    describe("Conversion Output Formatting", function()
    {
        describe("Duration", function()
        {

            describeFormatUnits("duration", [
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
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });


        describe("Distance", function()
        {

            describe("Metric", function()
            {
                describeFormatUnits("distance", [
                    {
                        output: "999999",
                        input: 999999000 
                    },
                    {
                        output: "999999",
                        input: 10000000000
                    },
                    {
                        output: "1.00",
                        input: 1000 
                    },
                    {
                        output: "0.00",
                        input: 0
                    },
                    {
                        input: null,
                        output: "",
                    },
                    {
                        input: "",
                        output: ""
                    },
                    {
                        output: "0.00",
                        input: -1
                    },
                    {
                        output: "99.9",
                        input: 99888.88
                    },
                    {
                        output: "9.99",
                        input: 9988.89
                    }
                ]);
            });

            describe("English", function()
            {

                describeFormatUnits("distance", [
                    {
                        output: "1.00",
                        input: 1609
                    },
                    {
                        output: "2.00",
                        input: 3219
                    },
                    {
                        output: "0.00",
                        input: 0
                    },
                    {
                        output: "0.00",
                        input: -1
                    },
                    {
                        output: "",
                        input: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });

            describe("English Swim", function()
            {
                describeFormatUnits("distance", [
                    {
                        output: "1000",
                        input: 914.4
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 1
                });
            });

            describe("English Rowing", function()
            {
                describeFormatUnits("distance", [
                    {
                        output: "1000",
                        input: 1000 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 12
                });
            });
        });

        describe("Speed", function()
        {
            describe("Metric", function()
            {
                describeFormatUnits("speed", [
                    {
                        output: "999",
                        input: 277.5
                    },
                    {
                        output: "999",
                        input: 1000
                    },
                    {
                        output: "9.97",
                        input: 2.77
                    },
                    {
                        output: "0.00",
                        input: 0
                    },
                    {
                        output: "0.00",
                        input: -1
                    },
                    {
                        output: "",
                        input: null
                    }
                ]);
            });

            describe("English", function()
            {

                describeFormatUnits("speed", [
                    {
                        output: "999",
                        input: 446.5
                    },
                    {
                        output: "999",
                        input: 600
                    },
                    {
                        output: "999",
                        input: 446.5
                    },
                    {
                        output: "10.0",
                        input: 4.47 
                    },
                    {
                        output: "0.00",
                        input: 0
                    },
                    {
                        output: "0.00",
                        input: -1
                    },
                    {
                        output: "",
                        input: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });

            describe("English swim", function()
            {
                describeFormatUnits("speed", [
                    {
                        output: "999",
                        input: 913.4 
                    },
                    {
                        output: "999",
                        input: 999
                    },
                    {
                        output: "999",
                        input: 1000
                    },
                    {
                        output: "9.97",
                        input: 0.152 
                    },
                    {
                        output: "0.00",
                        input: 0
                    },
                    {
                        output: "0.00",
                        input: -1
                    },
                    {
                        output: "",
                        input: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 1
                });
            });
            
        });

        describe("Pace", function()
        {

            describe("Metric", function()
            {
                describeFormatUnits("pace", [
                    {
                        output: "1:39:59",
                        input: 0.16669444907484582 // 00:99:59
                    },
                    {
                        output: "00:01",
                        input: 1000 // 00:00:01
                    },
                    {
                        output: "00:01",
                        input: 2000 // < 00:00:01
                    },
                    {
                        output: "99:59:59",
                        input: 0.0027777854938485945 // 99:59:59
                    },
                    {
                        output: "99:59:58",
                        input: 0.0027777932099622774 // 99:59:58
                    },
                    {
                        output: "01:00",
                        input: 16.666666666666664 // ::59.99
                    },
                    {
                        output: "99:59:59",
                        input: 0.002 // > 99:59:59 
                    },
                    {
                        output: "",
                        input: null
                    },
                    {
                        input: "",
                        output: ""
                    }
                ]);
            });

            describe("English", function()
            {
                describeFormatUnits("pace", [
                    {
                        output: "1:39:59",
                        input: 0.2682687464770762 // 00:99:59
                    },
                    {
                        output: "00:01",
                        input: 1609.34421011598 // 00:00:01
                    },
                    {
                        output: "00:01",
                        input: 2000 // < 00:00:01
                    },
                    {
                        output: "99:59:59",
                        input: 0.0044704130014693935 // 99:59:59
                    },
                    {
                        output: "99:59:58",
                        input: 0.0044704254193522735 // 99:59:58
                    },
                    {
                        output: "01:00",
                        input: 26.822403501933 // ::59.99
                    },
                    {
                        output: "99:59:59",
                        input: 0.0001 // > 99:59:59 
                    },
                    {
                        output: "",
                        input: null
                    },
                    {
                        input: "",
                        output: ""
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                });
            });

            describe("English Swim", function()
            {
                describeFormatUnits("pace", [
                    {
                        output: "01:31",
                        input: 1 
                    },
                    {
                        output: "00:18",
                        input: 5 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 1
                });
            });

            describe("English Row, should remain in meters", function()
            {
                describeFormatUnits("pace", [
                    {
                        output: "01:40",
                        input: 1 
                    },
                    {
                        output: "00:20",
                        input: 5 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 12
                });
            });

            describe("Metric Swim", function()
            {
                describeFormatUnits("pace", [
                    {
                        output: "01:40",
                        input: 1 
                    },
                    {
                        output: "00:20",
                        input: 5 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.Metric,
                    workoutTypeId: 1
                });
            });
        });

        describe("Calories", function()
        {

            describeFormatUnits("calories", [
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
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                },
                {
                    input: "-1",
                    output: "0"
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
            describeFormatUnits("elevationGain", [
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
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                },
                {
                    input: "-1",
                    output: "0"
                },
                {
                    input: "1.23",
                    output: "1"
                }
            ]);
        });

        describe("Elevation Loss", function()
        {
            describeFormatUnits("elevationLoss", [
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
                    input: null,
                    output: "",
                },
                {
                    input: "",
                    output: ""
                },
                {
                    input: "-1",
                    output: "0"
                },
                {
                    input: "23.45",
                    output: "23"
                }
            ]);
        });

        describe("Elevation", function()
        {
            describe("Metric", function()
            {

                describeFormatUnits("elevation", [
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
                    },
                    {
                        input: "",
                        output: ""
                    }
                ]);
            });

            describe("English", function()
            {

                describeFormatUnits("elevation", [
                    {
                        input: 35000,
                        output: "99999"
                    },
                    {
                        input: "10",
                        output: "33"
                    },
                    {
                        input: "0",
                        output: "0"
                    },
                    {
                        input: "-1",
                        output: "-3"
                    },
                    {
                        input: "-10000",
                        output: "-15000"
                    },
                    {
                        input: null,
                        output: ""
                    },
                    {
                        input: "",
                        output: ""
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });

            });

        });

        describe("Energy", function()
        {
            describeFormatUnits("energy", [
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
                    output: "0"
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });

        describe("TSS", function()
        {
            describeFormatUnits("tss", [
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
            describeFormatUnits("if", [
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
                    output: "0.00"
                },
                {
                    input: "0.234",
                    output: "0.23"
                },
                {
                    input: "-1",
                    output: "0.00"
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });

        describe("Power", function()
        {
            describeFormatUnits("power", [
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
                    output: "0",
                    input: "0"
                },
                {
                    input: "-1",
                    output: "0"
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });

        describe("HeartRate", function()
        {
            describeFormatUnits("heartrate", [
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
                    output: "0",
                    input: "0"
                },
                {
                    input: "-1",
                    output: "0"
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });

        describe("Cadence", function()
        {
            describeFormatUnits("cadence", [
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
                    output: "0",
                    input: 0
                },
                {
                    output: "0",
                    input: -1
                },
                {
                    input: null,
                    output: ""
                },
                {
                    input: "",
                    output: ""
                }
            ]);
        });

        describe("Torque", function()
        {

            describe("Metric", function()
            {
                describeFormatUnits("torque", [
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
                        output: "0.00"
                    },
                    {
                        input: "-1",
                        output: "0.00"
                    },
                    {
                        input: "1.234",
                        output: "1.23"
                    },
                    {
                        input: 12.36,
                        output: "12.4"
                    },
                    {
                        input: null,
                        output: ""
                    },
                    {
                        input: "",
                        output: ""
                    }
                ]);
            });

            describe("English", function()
            {
                describeFormatUnits("torque", [
                    {
                        output: "885",
                        input: 100
                    },
                    {
                        input: "123.45",
                        output: "1093"
                    },
                    {
                        input: "1.2345",
                        output: "10.9"
                    },
                    {
                        input: "0",
                        output: "0.00"
                    },
                    {
                        input: "-1",
                        output: "0.00"
                    },
                    {
                        input: null,
                        output: ""
                    },
                    {
                        input: "",
                        output: ""
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });
        });

        describe("Temperature", function()
        {

            describe("Metric", function()
            {
                describeFormatUnits("temperature", [
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
                    },
                    {
                        input: "",
                        output: ""
                    }
                ]);
            });

            describe("English", function()
            {
                describeFormatUnits("temperature", [
                    {
                        output: "999",
                        input: 999
                    },
                    {
                        output: "32",
                        input: 0
                    },
                    {
                        output: "30",
                        input: -1
                    },
                    {
                        output: "-58",
                        input: -50
                    },
                    {
                        output: "-999",
                        input: -1000
                    },
                    {
                        input: null,
                        output: ""
                    },
                    {
                        input: "",
                        output: ""
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });
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
