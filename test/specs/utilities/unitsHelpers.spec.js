requirejs(
[
    "utilities/printUnitLabel",
    "utilities/convertToViewUnits"
],
function(printUnitLabel, convertToViewUnits)
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
                expect(printUnitLabel("calories")).toBe("cal");
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
                expect(printUnitLabel("tss")).toBe("");
            });

            it("should print the unit label for intensity factory", function()
            {
                expect(printUnitLabel("if")).toBe("");
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
                expect(function() { convertToViewUnits(1234, "unknownType"); }).toThrow();
            });
            
            it("should convert a distance in meters to miles and cut off after 2 decimal places", function()
            {
                expect(convertToViewUnits(0, "distance")).toBe("0.00");
                expect(convertToViewUnits(1609, "distance")).toBe("1.00");
                expect(convertToViewUnits(3218, "distance")).toBe("2.00");
                expect(convertToViewUnits(1234567890, "distance")).toBe("767124.68");
                expect(convertToViewUnits("notANumber", "distance")).toBe("");
                expect(convertToViewUnits(-1609, "distance")).toBe("-1.00");
            });

            it("should convert an elevation in meters to ft and cut off after 2 decimal places", function()
            {
                expect(convertToViewUnits(0, "elevation")).toBe("0");
                expect(convertToViewUnits(1000, "elevation")).toBe("3281");
                expect(convertToViewUnits(1000000, "elevation")).toBe("3280840");
                expect(convertToViewUnits(-1000, "elevation")).toBe("-3281");
            });

            it("should convert a pace value in meters per second to min/mile, properly formated", function()
            {
                expect(convertToViewUnits(1, "pace")).toBe("26:49");
                expect(convertToViewUnits(3, "pace")).toBe("08:56");
                expect(convertToViewUnits("notAnumber", "pace")).toBe("");
                expect(convertToViewUnits(0.005, "pace")).toBe("99:99");
                expect(convertToViewUnits(-1, "pace")).toBe("99:99");
            });
        });
    });
});