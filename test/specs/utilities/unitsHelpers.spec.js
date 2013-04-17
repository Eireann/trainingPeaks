requirejs(
[
    "utilities/printUnitLabel",
    "utilities/conversion"
],
function(printUnitLabel, conversion)
{
    describe("units related utilities, english units", function()
    {
        var theMarsApp =
        {
            user:
            {
                get: function(system)
                {
                    return 0;
                }
            }
        };
         
        describe("convertToModelUnits template helper", function()
        {
        });

        describe("convertToViewUnits template helper", function()
        {

        });
        
        describe("printUnitLabel template helper", function()
        {
            it("should print the unit label for distance", function()
            {
                expect(printUnitLabel("distance")).toBe("mi");
            });

            it("should print the unit label for normalized pace", function()
            {
                expect(printUnitLabel("normalizedPace")).toBe("min/mile");
            });

            it("should print the unit label for averagePace", function()
            {
                expect(printUnitLabel("averagePace")).toBe("min/mile");
            });

            it("should print the unit label for average speed", function()
            {
                expect(printUnitLabel("averageSpeed")).toBe("mph");
            });

            it("should print the unit label for calories", function()
            {
                expect(printUnitLabel("calories")).toBe("kcal");
            });

            it("should print the unit label for elevation gain", function()
            {
                expect(printUnitLabel("elevationGain")).toBe("ft");
            });

            it("should print the unit label for elevationloss", function()
            {
                expect(printUnitLabel("elevationLoss")).toBe("ft");
            });

            it("should print the unit label for tss", function()
            {
                expect(printUnitLabel("tss")).toBe("TSS");
            });

            it("should print the unit label for intensity factory", function()
            {
                expect(printUnitLabel("if")).toBe("IF");
            });

            it("should print the unit label for energy", function()
            {
                expect(printUnitLabel("energy")).toBe("kJ");
            });

            it("should print the unit label for temperature", function()
            {
                expect(printUnitLabel("temperature")).toBe("F");
            });

            it("should print the unit label for heart rate", function()
            {
                expect(printUnitLabel("heartrate")).toBe("bpm");
            });

            it("should print the unit label for pace", function()
            {
                expect(printUnitLabel("pace")).toBe("min/mile");
            });

            it("should print the unit label for speed", function()
            {
                expect(printUnitLabel("speed")).toBe("mph");
            });

            it("should print the unit label for cadence", function()
            {
                expect(printUnitLabel("cadence")).toBe("rpm");
            });

            it("should print the unit label for torque", function()
            {
                expect(printUnitLabel("torque")).toBe("ft/lbs");
            });

            it("shouuld print the unit label for elevation", function()
            {
                expect(printUnitLabel("elevation")).toBe("ft");
            });

            it("should print the unit label for power", function()
            {
                expect(printUnitLabel("power")).toBe("W");
            });

            it("should throw an exception if an uknown value type is requested", function()
            {
                expect(function() { printUnitLabel("unknown"); }).toThrow();
            });
        });
        
        describe("convertToViewUnits template helper", function()
        {
            it("should throw an exception when trying to convert for an unknown value type", function()
            {
                expect(function() { conversion.convertToViewUnits(1234, "unknownType"); }).toThrow();
            });

            it("should convert a distance in meters to miles and cut off after 2 decimal places", function()
            {
                expect(conversion.convertToViewUnits(0, "distance")).toBe("0.00");
                expect(conversion.convertToViewUnits(1609, "distance")).toBe("1.00");
                expect(conversion.convertToViewUnits(3218, "distance")).toBe("2.00");
                expect(conversion.convertToViewUnits(1234567890, "distance")).toBe(767125);
                expect(conversion.convertToViewUnits("notANumber", "distance")).toBe("");
                expect(conversion.convertToViewUnits(-1609, "distance")).toBe("-1.00");
            });

            it("should convert an elevation in meters to ft and cut off after 2 decimal places", function()
            {
                expect(conversion.convertToViewUnits(0, "elevation")).toBe("0");
                expect(conversion.convertToViewUnits(1000, "elevation")).toBe("3281");
                expect(conversion.convertToViewUnits(1000000, "elevation")).toBe("3280840");
                expect(conversion.convertToViewUnits(-1000, "elevation")).toBe("-3281");
            });

            it("should convert a pace value in meters per second to min/mile, properly formated", function()
            {
                expect(conversion.convertToViewUnits(1, "pace")).toBe("26:49");
                expect(conversion.convertToViewUnits(3, "pace")).toBe("08:56");
                expect(conversion.convertToViewUnits("notAnumber", "pace")).toBe("");
                expect(conversion.convertToViewUnits(0.005, "pace")).toBe("99:99");
                expect(conversion.convertToViewUnits(-1, "pace")).toBe("99:99");
            });


            it("should return empty string for non numeric values", function()
            {
                expect(conversion.convertToViewUnits("", "distance")).toBe("");
                expect(conversion.convertToViewUnits("some string", "distance")).toBe("");
            });
        });
        
        describe("convertToModelUnits template helper", function ()
        {

            it("should throw an exception when trying to convert for an unknown value type", function ()
            {
                expect(function () { conversion.convertToModelUnits(1234, "unknownType"); }).toThrow();
            });

            it("should convert a distance in miles to meters", function ()
            {
                expect(conversion.convertToModelUnits(0, "distance")).toBe(0);
                expect(conversion.convertToModelUnits(1, "distance")).toBeCloseTo(1609, 0);
                expect(conversion.convertToModelUnits(2, "distance")).toBeCloseTo(3218.689, 4);
                expect(conversion.convertToModelUnits(767124.68, "distance")).toBeCloseTo(1234567883, 0);
                expect(conversion.convertToModelUnits(-1, "distance")).toBeCloseTo(-1609, 0);
            });
            
            it("should convert an elevation in ft to meters", function ()
            {
                expect(conversion.convertToModelUnits(0, "elevation")).toBe(0);
                expect(conversion.convertToModelUnits(3281, "elevation")).toBeCloseTo(1000, 0);
                expect(conversion.convertToModelUnits(3280840, "elevation")).toBeCloseTo(1000000, 0);
                expect(conversion.convertToModelUnits(-3281, "elevation")).toBeCloseTo(-1000, 0);
            });

            it("should convert a pace value in min/mile to meters per second", function ()
            {
                expect(conversion.convertToModelUnits("26:49", "pace")).toBeCloseTo(1);
                expect(conversion.convertToModelUnits("08:56", "pace")).toBeCloseTo(3, 0);
                expect(conversion.convertToModelUnits("99:99", "pace")).toBeCloseTo(0.266, 3);
            });

            it("should return null for non numeric values and empty strings", function()
            {
                expect(conversion.convertToModelUnits("", "elevation")).toBe(null);
                expect(conversion.convertToModelUnits("", "temperature")).toBe(null);
                expect(conversion.convertToModelUnits("", "pace")).toBe(null);
                expect(conversion.convertToModelUnits("", "distance")).toBe(null);
                expect(conversion.convertToModelUnits("some string", "distance")).toBe(null);
            });

            
        });
    });
});