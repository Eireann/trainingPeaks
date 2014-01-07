define(
[
    "underscore",
    "testUtils/testHelpers",
    "TP",
    "utilities/conversion/conversion",
    "utilities/datetime/datetime"
],
function(_, testHelpers, TP, conversion, dateTimeUtils)
{

    var describeParseUnits = function(units, testValues, options)
    {
        _.each(testValues, function(testValue)
        {
            it("conversion.parseUnitsValue(" + units + ", " + testValue.input + ") Should return " + testValue.output, function()
            {
                var parseOptions =  _.defaults({}, testValue.options, options);
                var marginOfError = testValue.marginOfError || 0.5;
                expect(conversion.parseUnitsValue(units, testValue.input, parseOptions)).to.be.closeTo(testValue.output, marginOfError);
            });
        });

    };

    describe("Conversion Input Parsing", function()
    {
        describe("Circumference", function()
        {
            describe("Metric", function()
            {
                describeParseUnits("circumference", [
                    // 1 cm = 1 cm
                    {
                        input: 1, 
                        output: "1"
                    },
                    {
                        input: 0,
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

            describe("English", function()
            {
                describeParseUnits("circumference", [
                    // 1 cm = 0.393701 inch
                    {
                        input: 1,
                        output: "0.393701"
                    },
                    {
                        input: 0,
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

        describe("DateTime seconds", function()
        {

            beforeEach(function()
            {
                // we don't want to test units conversion here, just limiting, and db is metric, so use metric user preference
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("Should allow decimal seconds input", function()
            {
                expect(dateTimeUtils.convert.timeToDecimalHours("99:59:59.99")).to.eql(99 + (59 / 60) + (59.99 / 3600));
            });

            it("Should format decimal seconds output if there is a decimal value", function()
            {
                expect(dateTimeUtils.formatter.decimalHoursAsTime((59 / 60) + (59.99 / 3600), true, undefined, true)).to.eql("59:59.99");
            });

            it("Should not format decimal seconds output if there is not a decimal value", function()
            {
                expect(dateTimeUtils.formatter.decimalHoursAsTime((59 / 60) + (59 / 3600), true, undefined, true)).to.eql("59:59");
            });

            it("Should not format decimal seconds output if there is a decimal value but hours >= 1", function()
            {
                expect(dateTimeUtils.formatter.decimalHoursAsTime(1 + (59 / 60) + (59 / 3600), true, undefined, true)).to.eql("1:59:59");
            });

            it("Should not format decimal seconds output if the showDecimalSeconds parameter is false", function()
            {
                expect(dateTimeUtils.formatter.decimalHoursAsTime(98 + (59 / 60) + (59.99 / 3600), true, "00:00:00", false)).to.eql("99:00:00");
                expect(dateTimeUtils.formatter.decimalHoursAsTime(98 + (59 / 60) + (59.33 / 3600), true, "00:00:00", false)).to.eql("98:59:59");
            });

            it("Should round to the hundredth second, not truncate", function()
            {
                var decimalHours = dateTimeUtils.convert.millisecondsToDecimalHours(179510);
                var timeHours = dateTimeUtils.formatter.decimalHoursAsTime(decimalHours);
                expect(timeHours).to.eql("0:03:00");

                decimalHours = dateTimeUtils.convert.millisecondsToDecimalHours(179490);
                timeHours = dateTimeUtils.formatter.decimalHoursAsTime(decimalHours);
                expect(timeHours).to.eql("0:02:59");
            });

        });

        describe("Duration", function()
        {

            describeParseUnits("duration", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Distance", function()
        {

            describe("Metric", function()
            {
                describeParseUnits("distance", [
                    {
                        input: "999999",
                        output: 999999000 
                    },
                    {
                        input: "1000000",
                        output: 999999000 
                    },
                    {
                        input: "1",
                        output: 1000 
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
                        input: "",
                        output: null
                    }
                ]);
            });

            describe("English", function()
            {

                describeParseUnits("distance", [
                    {
                        input: "1",
                        output: 1609
                    },
                    {
                        input: "2",
                        output: 3219
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
                        input: "",
                        output: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });

            describe("English Swim", function()
            {
                describeParseUnits("distance", [
                    {
                        input: "1000",
                        output: 914.4
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 1
                });
            });

            describe("English Rowing", function()
            {
                describeParseUnits("distance", [
                    {
                        input: "1000",
                        output: 1000 
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
                describeParseUnits("speed", [
                    {
                        input: "999",
                        output: 277.5
                    },
                    {
                        input: "999.1",
                        output: 277.5
                    },
                    {
                        input: "1000",
                        output: 277.5
                    },
                    {
                        input: "10",
                        output: 2.77
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
                        input: "",
                        output: null
                    }
                ]);
            });

            describe("English", function()
            {

                describeParseUnits("speed", [
                    {
                        input: "999",
                        output: 446.5
                    },
                    {
                        input: "999.1",
                        output: 446.5
                    },
                    {
                        input: "1000",
                        output: 446.5
                    },
                    {
                        input: "10",
                        output: 4.47 
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
                        input: "",
                        output: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });

            describe("English swim", function()
            {
                describeParseUnits("speed", [
                    {
                        input: "999",
                        output: 15.22 
                    },
                    {
                        input: "999.1",
                        output: 15.22
                    },
                    {
                        input: "1000",
                        output: 15.22
                    },
                    {
                        input: "10",
                        output: 0.15
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
                        input: "",
                        output: null
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
                describeParseUnits("pace", [
                    {
                        input: "00:00:00",
                        output: 1000 
                    },
                    {
                        input: "00:00:01",
                        output: 1000 
                    },
                    {
                        input: "99:59",
                        output: 0.1666944,
                        marginOfError: 0.001
                    },
                    {
                        input: "99:59:59",
                        output: 0.00276
                    },
                    {
                        input: "99:59:59.99",
                        output: 0.00276
                    },
                    {
                        input: "::0.99",
                        output: 1000
                    },
                    {
                        input: "100:00:00",
                        output: 0.00276
                    },
                    {
                        input: "",
                        output: null
                    }
                ]);
            });

            describe("English", function()
            {
                describeParseUnits("pace", [
                    {
                        input: "00:00:00",
                        output: 1609 
                    },
                    {
                        input: "00:00:01",
                        output: 1609
                    },
                    {
                        input: "35:20",
                        output: 0.759,
                        marginOfError: 0.01
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });

            describe("English Swim", function()
            {
                describeParseUnits("pace", [
                    {
                        input: "01:31",
                        output: 1 
                    },
                    {
                        input: "00:18",
                        output: 5 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 1
                });
            });

            describe("English Row, should remain in meters", function()
            {
                describeParseUnits("pace", [
                    {
                        input: "01:40",
                        output: 1 
                    },
                    {
                        input: "00:20",
                        output: 5 
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English,
                    workoutTypeId: 12
                });
            });

            describe("Metric Swim", function()
            {
                describeParseUnits("pace", [
                    {
                        input: "01:40",
                        output: 1 
                    },
                    {
                        input: "00:20",
                        output: 5 
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
            describeParseUnits("calories", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Elevation Gain", function()
        {
            describeParseUnits("elevationGain", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Elevation Loss", function()
        {
            describeParseUnits("elevationLoss", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Elevation", function()
        {
            describe("Metric", function()
            {
                describeParseUnits("elevation", [
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
                    },
                    {
                        input: "",
                        output: null
                    }
                ]);
            });

            describe("English", function()
            {
                describeParseUnits("elevation", [
                    {
                        input: "99999",
                        output: 30479.7
                    },
                    {
                        input: "99999.1",
                        output: 30479.7
                    },
                    {
                        input: "100000",
                        output: 30479.7
                    },
                    {
                        input: "1",
                        output: 0.3047,
                        marginOfError: 0.0001
                    },
                    {
                        input: "0",
                        output: 0
                    },
                    {
                        input: "-1",
                        output: -0.3047,
                        marginOfError: 0.0001
                    },
                    {
                        input: "-15001",
                        output: -4572
                    },
                    {
                        input: "",
                        output: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });
        });

        describe("Energy", function()
        {
            describeParseUnits("energy", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("TSS", function()
        {
            describeParseUnits("tss", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("IF", function()
        {
            describeParseUnits("if", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Power", function()
        {
            describeParseUnits("power", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("HeartRate", function()
        {
            describeParseUnits("heartrate", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Cadence", function()
        {
            describeParseUnits("cadence", [
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
                },
                {
                    input: "",
                    output: null
                }
            ]);
        });

        describe("Torque", function()
        {
            describe("Metric", function()
            {
                describeParseUnits("torque", [
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
                    },
                    {
                        input: "",
                        output: null
                    }
                ]);
            });


            describe("English", function()
            {
                describeParseUnits("torque", [
                    {
                        input: "100",
                        output: 11.2984829
                    },
                    {
                        input: "10000",
                        output: 1129.735305171
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
                        input: "",
                        output: null
                    }
                ], {
                    userUnits: TP.utils.units.constants.English
                });
            });
        });

        describe("Temperature", function()
        {
            describe("Metric", function()
            {
                describeParseUnits("temperature", [
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
                    },
                    {
                        input: "",
                        output: null
                    }
                ]);
            });

            describe("English", function()
            {
                describeParseUnits("temperature", [
                    {
                        input: "202",
                        output: 94 
                    },
                    {
                        input: "1000",
                        output: 537
                    },
                    {
                        input: "32",
                        output: 0
                    },
                    {
                        input: 0,
                        output: -18
                    }, 
                    {
                        input: "",
                        output: null
                    }
                ],
                {
                    userUnits: TP.utils.units.constants.English
                });
            });
        });





    });

});
