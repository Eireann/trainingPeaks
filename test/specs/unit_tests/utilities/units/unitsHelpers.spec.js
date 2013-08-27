requirejs(
[
    "TP",
    "app"
],
function(TP, theMarsApp)
{
    describe("units related utilities, english units", function()
    {

        beforeEach(function()
        {
            theMarsApp.user.set("units", TP.utils.units.constants.English);
        });

        afterEach(function()
        {
            theMarsApp.user.set("units", TP.utils.units.constants.Metric);
        });
        
        describe("TP.utils.units.getUnitsLabel template helper", function()
        {
            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should return the unit label for distance", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance")).toBe("mi");
            });

            it("should return the non-abbreviated unit label for distance", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance", null, null, {abbreviated: false})).toBe("miles");
            });

            it("should return the non-abbreviated unit label for distance for swimming", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance", 1, null, {abbreviated: false})).toBe("yards");
            });

            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace")).toBe("min/mi");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace")).toBe("min/mi");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed")).toBe("mph");
            });

            it("should return the unit label for calories", function()
            {
                expect(TP.utils.units.getUnitsLabel("calories")).toBe("kcal");
            });

            it("should return the unit label for elevation gain", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationGain")).toBe("ft");
            });

            it("should return the unit label for elevationloss", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationLoss")).toBe("ft");
            });

            it("should return the unit label for tss", function()
            {
                expect(TP.utils.units.getUnitsLabel("tss")).toBe("TSS");
            });

            it("should return the unit label for tss with an integer tssSource", function()
            {
                var tssLabel = TP.utils.units.getUnitsLabel("tss", 0, { "tssSource": 2 });
                expect(tssLabel).toBe("rTSS");
            });

            it("should return the unit label for tss with a string trainingStressScoreActualSource", function()
            {
                var tssLabel = TP.utils.units.getUnitsLabel("tss", 0, { "trainingStressScoreActualSource": "SwimmingTss" });
                expect(tssLabel).toBe("sTSS");
            });

            it("should return the unit label for intensity factory", function()
            {
                expect(TP.utils.units.getUnitsLabel("if")).toBe("IF");
            });

            it("should return the unit label for energy", function()
            {
                expect(TP.utils.units.getUnitsLabel("energy")).toBe("kJ");
            });

            it("should return the unit label for temperature", function()
            {
                expect(TP.utils.units.getUnitsLabel("temperature")).toBe("F");
            });

            it("should return the unit label for heart rate", function()
            {
                expect(TP.utils.units.getUnitsLabel("heartrate")).toBe("bpm");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace")).toBe("min/mi");
            });

            it("should return the unit label for speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("speed")).toBe("mph");
            });

            it("should return the unit label for cadence", function()
            {
                expect(TP.utils.units.getUnitsLabel("cadence")).toBe("rpm");
            });

            it("should return the unit label for torque", function()
            {
                expect(TP.utils.units.getUnitsLabel("torque")).toBe("in-lbs");
            });

            it("shouuld return the unit label for elevation", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevation")).toBe("ft");
            });

            it("should return the unit label for power", function()
            {
                expect(TP.utils.units.getUnitsLabel("power")).toBe("watts");
            });

            it("should throw an exception if an uknown value type is requested", function()
            {
                expect(function() { TP.utils.units.getUnitsLabel("unknown"); }).toThrow();
            });
        });

        describe("convertToViewUnits template helper", function()
        {

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should throw an exception when trying to convert for an unknown value type", function()
            {
                expect(function() { TP.utils.conversion.convertToViewUnits(1234, "unknownType"); }).toThrow();
            });

            it("should convert a distance in meters to miles", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "distance")).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits(1609, "distance")).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToViewUnits(3218, "distance")).toBeCloseTo(2, 0);
                expect(TP.utils.conversion.convertToViewUnits(1234567890, "distance")).toBeCloseTo(767125, 0);
                expect(TP.utils.conversion.convertToViewUnits("notANumber", "distance")).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits(-1609, "distance")).toBeCloseTo(-1, 0);
            });

            it("should convert an elevation in meters to ft", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "elevation")).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits(1000, "elevation")).toBeCloseTo(3281, 0);
                expect(TP.utils.conversion.convertToViewUnits(1000000, "elevation")).toBeCloseTo(3280840, 0);
                expect(TP.utils.conversion.convertToViewUnits(-1000, "elevation")).toBeCloseTo(-3281, 0);
            });

            it("should convert a pace value in meters per second to min/mile, properly formated", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "pace")).toBe("26:49");
                expect(TP.utils.conversion.convertToViewUnits(3, "pace")).toBe("08:56");
                expect(TP.utils.conversion.convertToViewUnits("notAnumber", "pace")).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits(0.0005, "pace")).toBe("99:59:59.99");
                expect(TP.utils.conversion.convertToViewUnits(-1, "pace")).toBe("99:59:59.99");
            });


            it("should return zero for non numeric values", function()
            {
                expect(TP.utils.conversion.convertToViewUnits("", "distance")).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits("some string", "distance")).toBe(0);
            });

            it("Should convert temperatures", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "temperature")).toBe(32);
                expect(TP.utils.conversion.convertToViewUnits(100, "temperature")).toBe(212);
            });

            it("should convert and format efficiency factor values for run", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0.016512562392295274, "efficiencyfactor", null, 3)).toBeCloseTo(1.08, 2);
            });
 
            it("should format efficiency factor values for other sport types", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0.016512562392295274, "efficiencyfactor", null, 10)).toBeCloseTo(0.02, 2);
            });           
        });

        describe("convertToModelUnits template helper", function()
        {

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

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

            it("Should convert temperatures", function()
            {
                expect(TP.utils.conversion.convertToModelUnits(32, "temperature")).toBe(0);
                expect(TP.utils.conversion.convertToModelUnits(212, "temperature")).toBe(100);
            });
        });

        describe("TP.utils.units.getUnitsLabel, for swim workouts in english units", function()
        {

            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should return the unit label for distance", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance", swimTypeId)).toBe("yds");
            });

            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace", swimTypeId)).toBe("sec/100y");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace", swimTypeId)).toBe("sec/100y");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed", swimTypeId)).toBe("yds/min");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace", swimTypeId)).toBe("sec/100y");
            });

            it("should return the unit label for speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("speed", swimTypeId)).toBe("yds/min");
            });

        });

        describe("TP.utils.units.getUnitsLabel, for swim workouts in metric units", function()
        {

            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

           it("should return the unit label for distance", function()
            {
                expect(TP.utils.units.getUnitsLabel("distance", swimTypeId)).toBe("m");
            });

            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace", swimTypeId)).toBe("sec/100m");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace", swimTypeId)).toBe("sec/100m");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed", swimTypeId)).toBe("m/min");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace", swimTypeId)).toBe("sec/100m");
            });

            it("should return the unit label for speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("speed", swimTypeId)).toBe("m/min");
            });

        });

        describe("convertToViewUnits template helper, for swim workouts in english units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a distance in meters to yards", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "distance", undefined, swimTypeId)).toBe(0);
                expect(TP.utils.conversion.convertToViewUnits(1, "distance", undefined, swimTypeId)).toBeCloseTo(1.09, 2);
                expect(TP.utils.conversion.convertToViewUnits(10, "distance", undefined, swimTypeId)).toBeCloseTo(10.9, 1);
                expect(TP.utils.conversion.convertToViewUnits(100, "distance", undefined, swimTypeId)).toBeCloseTo(109, 0);
                expect(TP.utils.conversion.convertToViewUnits(1000, "distance", undefined, swimTypeId)).toBeCloseTo(1094, 0);
                expect(TP.utils.conversion.convertToViewUnits(1125, "distance", undefined, swimTypeId)).toBeCloseTo(1230, 0);
            });

            it("should convert a pace value in meters per second to sec/100y, properly formated", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "pace", undefined, swimTypeId)).toBe("01:31");
                expect(TP.utils.conversion.convertToViewUnits(5, "pace", undefined, swimTypeId)).toBe("00:18");

            });

            it("Should convert a speed in meters per second to yards per minute, properly formatted", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "speed", undefined, swimTypeId)).toBeCloseTo(65.6, 1);
                expect(TP.utils.conversion.convertToViewUnits(5, "speed", undefined, swimTypeId)).toBeCloseTo(328, 0);
            });
            
        });

        describe("convertToViewUnits template helper, for swim workouts in metric units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should leave distance units as meters", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(0, "distance", undefined, swimTypeId)).toBeCloseTo(0, 0);
                expect(TP.utils.conversion.convertToViewUnits(1, "distance", undefined, swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToViewUnits(10, "distance", undefined, swimTypeId)).toBeCloseTo(10, 0);
                expect(TP.utils.conversion.convertToViewUnits(100, "distance", undefined, swimTypeId)).toBeCloseTo(100, 0);
                expect(TP.utils.conversion.convertToViewUnits(1000, "distance", undefined, swimTypeId)).toBeCloseTo(1000, 0);
                expect(TP.utils.conversion.convertToViewUnits(1125, "distance", undefined, swimTypeId)).toBeCloseTo(1125, 0);
            });

            it("should convert a pace value in meters per second to sec/100m, properly formated", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "pace", undefined, swimTypeId)).toBe("01:40");
                expect(TP.utils.conversion.convertToViewUnits(5, "pace", undefined, swimTypeId)).toBe("00:20");

            });

            it("Should convert a speed in meters per second to meters per minute", function()
            {
                expect(TP.utils.conversion.convertToViewUnits(1, "speed", undefined, swimTypeId)).toBe(60);
                expect(TP.utils.conversion.convertToViewUnits(5, "speed", undefined, swimTypeId)).toBe(300);
            });
            
        });

        describe("convertToModelUnits template helper, for swim workouts in english units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");
 
            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a distance in yards to meters", function()
            {
                expect(TP.utils.conversion.convertToModelUnits("", "distance", swimTypeId)).toBeNull();
                expect(TP.utils.conversion.convertToModelUnits('1.09', "distance", swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToModelUnits("10.9", "distance", swimTypeId)).toBeCloseTo(10, 0);
                expect(TP.utils.conversion.convertToModelUnits(109, "distance", swimTypeId)).toBeCloseTo(100, 0);
                expect(TP.utils.conversion.convertToModelUnits(1094, "distance", swimTypeId)).toBeCloseTo(1000, 0);
                expect(TP.utils.conversion.convertToModelUnits(1230, "distance", swimTypeId)).toBeCloseTo(1125, 0);
            });

            it("should convert a pace value in sec/100y to meters per second", function()
            {
                expect(TP.utils.conversion.convertToModelUnits("01:31", "pace", swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToModelUnits("00:18", "pace", swimTypeId)).toBeCloseTo(5, 0);

            });

            it("Should convert a speed in yards per minute to meters per second", function()
            {
                expect(TP.utils.conversion.convertToModelUnits("65.6", "speed", swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToModelUnits("328", "speed", swimTypeId)).toBeCloseTo(5, 0);
            });
 
        });

        describe("convertToModelUnits template helper, for swim workouts in metric units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                theMarsApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should leave distance units as meters", function()
            {
                expect(TP.utils.conversion.convertToModelUnits(0, "distance", swimTypeId)).toBe(0);
                expect(TP.utils.conversion.convertToModelUnits(1, "distance", swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToModelUnits(10, "distance", swimTypeId)).toBeCloseTo(10, 0);
                expect(TP.utils.conversion.convertToModelUnits(100, "distance", swimTypeId)).toBeCloseTo(100, 0);
                expect(TP.utils.conversion.convertToModelUnits(1000, "distance", swimTypeId)).toBeCloseTo(1000, 0);
                expect(TP.utils.conversion.convertToModelUnits(1125, "distance", swimTypeId)).toBeCloseTo(1125, 0);
            });

            it("should convert a pace value in meters per second to sec/100m, properly formated", function()
            {
                expect(TP.utils.conversion.convertToModelUnits("01:40", "pace", swimTypeId)).toBeCloseTo(1, 0);
                expect(TP.utils.conversion.convertToModelUnits("00:20", "pace", swimTypeId)).toBeCloseTo(5, 0);

            });

            it("Should convert a speed in meters per second to meters per minute, properly formatted", function()
            {
                expect(TP.utils.conversion.convertToModelUnits(60, "speed", swimTypeId)).toBe(1);
                expect(TP.utils.conversion.convertToModelUnits(300, "speed", swimTypeId)).toBe(5);
            });
            
        });
    });
});