requirejs(
[
    "TP"
],
function(TP)
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
        
        describe("TP.utils.units.getUnitsLabel template helper", function()
        {
            it("should print the unit label for distance", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance")).toBe("mi");
            });

            it("should print the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace")).toBe("min/mile");
            });

            it("should print the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace")).toBe("min/mile");
            });

            it("should print the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed")).toBe("mph");
            });

            it("should print the unit label for calories", function()
            {
                expect(TP.utils.units.getUnitsLabel("calories")).toBe("kcal");
            });

            it("should print the unit label for elevation gain", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationGain")).toBe("ft");
            });

            it("should print the unit label for elevationloss", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationLoss")).toBe("ft");
            });

            it("should print the unit label for tss", function()
            {
                expect(TP.utils.units.getUnitsLabel("tss")).toBe("TSS");
            });

            it("should print the unit label for intensity factory", function()
            {
                expect(TP.utils.units.getUnitsLabel("if")).toBe("IF");
            });

            it("should print the unit label for energy", function()
            {
                expect(TP.utils.units.getUnitsLabel("energy")).toBe("kJ");
            });

            it("should print the unit label for temperature", function()
            {
                expect(TP.utils.units.getUnitsLabel("temperature")).toBe("F");
            });

            it("should print the unit label for heart rate", function()
            {
                expect(TP.utils.units.getUnitsLabel("heartrate")).toBe("bpm");
            });

            it("should print the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace")).toBe("min/mile");
            });

            it("should print the unit label for speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("speed")).toBe("mph");
            });

            it("should print the unit label for cadence", function()
            {
                expect(TP.utils.units.getUnitsLabel("cadence")).toBe("rpm");
            });

            it("should print the unit label for torque", function()
            {
                expect(TP.utils.units.getUnitsLabel("torque")).toBe("ft/lbs");
            });

            it("shouuld print the unit label for elevation", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevation")).toBe("ft");
            });

            it("should print the unit label for power", function()
            {
                expect(TP.utils.units.getUnitsLabel("power")).toBe("W");
            });

            it("should throw an exception if an uknown value type is requested", function()
            {
                expect(function() { TP.utils.units.getUnitsLabel("unknown"); }).toThrow();
            });
        });
        
        describe("convertToViewUnits template helper", function()
        {
            it("should throw an exception when trying to convert for an unknown value type", function()
            {
                expect(function() { TP.utils.conversion.convertToViewUnits(1234, "unknownType"); }).toThrow();
            });

            it("should convert a distance in meters to miles and cut off after 2 decimal places", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "distance")).toBe("");
                expect(TP.utils.conversion.convertToViewUnits(1609, "distance")).toBe("1.00");
                expect(TP.utils.conversion.convertToViewUnits(3218, "distance")).toBe("2.00");
                expect(TP.utils.conversion.convertToViewUnits(1234567890, "distance")).toBe(767125);
                expect(TP.utils.conversion.convertToViewUnits("notANumber", "distance")).toBe("");
                expect(TP.utils.conversion.convertToViewUnits(-1609, "distance")).toBe("-1.00");
            });

            it("should convert an elevation in meters to ft and cut off after 2 decimal places", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "elevation")).toBe("");
                expect(TP.utils.conversion.convertToViewUnits(1000, "elevation")).toBe("3281");
                expect(TP.utils.conversion.convertToViewUnits(1000000, "elevation")).toBe("3280840");
                expect(TP.utils.conversion.convertToViewUnits(-1000, "elevation")).toBe("-3281");
            });

            it("should convert a pace value in meters per second to min/mile, properly formated", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "pace")).toBe("26:49");
                expect(TP.utils.conversion.convertToViewUnits(3, "pace")).toBe("08:56");
                expect(TP.utils.conversion.convertToViewUnits("notAnumber", "pace")).toBe("");
                expect(TP.utils.conversion.convertToViewUnits(0.005, "pace")).toBe("99:99");
                expect(TP.utils.conversion.convertToViewUnits(-1, "pace")).toBe("99:99");
            });


            it("should return empty string for non numeric values", function()
            {
                expect(TP.utils.conversion.convertToViewUnits("", "distance")).toBe("");
                expect(TP.utils.conversion.convertToViewUnits("some string", "distance")).toBe("");
            });
        });
        
        describe("convertToModelUnits template helper", function ()
        {

            it("should throw an exception when trying to convert for an unknown value type", function ()
            {
                expect(function () { TP.utils.conversion.convertToModelUnits(1234, "unknownType"); }).toThrow();
            });

            it("should convert a distance in miles to meters", function ()
            {
                expect(TP.utils.conversion.convertToModelUnits(0, "distance")).toBe(0);
                expect(TP.utils.conversion.convertToModelUnits(1, "distance")).toBeCloseTo(1609, 0);
                expect(TP.utils.conversion.convertToModelUnits(2, "distance")).toBeCloseTo(3218.689, 4);
                expect(TP.utils.conversion.convertToModelUnits(767124.68, "distance")).toBeCloseTo(1234567883, 0);
                expect(TP.utils.conversion.convertToModelUnits(-1, "distance")).toBeCloseTo(-1609, 0);
            });
            
            it("should convert an elevation in ft to meters", function ()
            {
                expect(TP.utils.conversion.convertToModelUnits(0, "elevation")).toBe(0);
                expect(TP.utils.conversion.convertToModelUnits(3281, "elevation")).toBeCloseTo(1000, 0);
                expect(TP.utils.conversion.convertToModelUnits(3280840, "elevation")).toBeCloseTo(1000000, 0);
                expect(TP.utils.conversion.convertToModelUnits(-3281, "elevation")).toBeCloseTo(-1000, 0);
            });

            it("should convert a pace value in min/mile to meters per second", function ()
            {
                expect(TP.utils.conversion.convertToModelUnits("26:49", "pace")).toBeCloseTo(1);
                expect(TP.utils.conversion.convertToModelUnits("08:56", "pace")).toBeCloseTo(3, 0);
                expect(TP.utils.conversion.convertToModelUnits("99:99", "pace")).toBeCloseTo(0.266, 3);
            });

            it("should return null for non numeric values and empty strings", function()
            {
                expect(TP.utils.conversion.convertToModelUnits("", "elevation")).toBe(null);
                expect(TP.utils.conversion.convertToModelUnits("", "temperature")).toBe(null);
                expect(TP.utils.conversion.convertToModelUnits("", "pace")).toBe(null);
                expect(TP.utils.conversion.convertToModelUnits("", "distance")).toBe(null);
                expect(TP.utils.conversion.convertToModelUnits("some string", "distance")).toBe(null);
            });

            
        });
    });
});