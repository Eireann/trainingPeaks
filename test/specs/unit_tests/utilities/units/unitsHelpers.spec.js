define(
[
    "TP",
    "utilities/conversion/convertToViewUnits",
    "utilities/conversion/convertToModelUnits",
    "utilities/units/unitsStrategyFactory",
    "utilities/units/constants",
    "testUtils/testHelpers"
],
function(
         TP,
         convertToViewUnits,
         convertToModelUnits,
         UnitsStrategyFactory,
         unitConstants,
         testHelpers
         )
{
    describe("units related utilities, english units", function()
    {

        beforeEach(function()
        {
            testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
        });

        afterEach(function()
        {
            testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
        });
        
        describe("TP.utils.units.getUnitsLabel template helper", function()
        {
            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });


            describe("distance", function()
            {

                it("should return the unit label for distance", function()
                {
                    var unitsStrategy = UnitsStrategyFactory.buildStrategyForUnits("distance", { userUnits: unitConstants.English });
                    expect(unitsStrategy.getLabel()).to.equal("mi");
                    expect(unitsStrategy.getLabelShort()).to.equal("mi");
                });


                it("should return the non-abbreviated unit label for distance", function()
                {
                    var unitsStrategy = UnitsStrategyFactory.buildStrategyForUnits("distance", { userUnits: unitConstants.Metric });
                    expect(unitsStrategy.getLabelLong()).to.equal("kilometers");
                });

                it("should return the metric unit label for rowing distance (special case for rowing)", function()
                {
                    var unitsStrategy = UnitsStrategyFactory.buildStrategyForUnits("distance", { userUnits: unitConstants.English, workoutTypeId: 12 });
                    expect(unitsStrategy.getLabel()).to.equal("m");
                });

                it("should return the non-abbreviated unit label for distance for swimming", function()
                {
                    var unitsStrategy = UnitsStrategyFactory.buildStrategyForUnits("distance", { userUnits: unitConstants.English, workoutTypeId: 1 });
                    expect(unitsStrategy.getLabelLong()).to.equal("yards");
                });

            });

            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace")).to.equal("min/mi");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace")).to.equal("min/mi");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed")).to.equal("mph");
            });

            it("should return the unit label for average speed for rowing", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed", 12)).to.equal("m/min");
            });

            it("should return the unit label for calories", function()
            {
                expect(TP.utils.units.getUnitsLabel("calories")).to.equal("kcal");
            });

            it("should return the unit label for elevation gain", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationGain")).to.equal("ft");
            });

            it("should return the unit label for elevationloss", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevationLoss")).to.equal("ft");
            });

            it("should return the unit label for tss", function()
            {
                expect(TP.utils.units.getUnitsLabel("tss")).to.equal("TSS");
            });

            it("should return the unit label for tss with an integer tssSource", function()
            {
                var tssLabel = TP.utils.units.getUnitsLabel("tss", 0, { "tssSource": 2 });
                expect(tssLabel).to.equal("rTSS");
            });

            it("should return the unit label for tss with a string trainingStressScoreActualSource", function()
            {
                var tssLabel = TP.utils.units.getUnitsLabel("tss", 0, { "trainingStressScoreActualSource": "SwimmingTss" });
                expect(tssLabel).to.equal("sTSS");
            });

            it("should return the unit label for intensity factory", function()
            {
                expect(TP.utils.units.getUnitsLabel("if")).to.equal("IF");
            });

            it("should return the unit label for energy", function()
            {
                expect(TP.utils.units.getUnitsLabel("energy")).to.equal("kJ");
            });

            it("should return the unit label for temperature", function()
            {
                expect(TP.utils.units.getUnitsLabel("temperature")).to.equal("F");
            });

            it("should return the unit label for heart rate", function()
            {
                expect(TP.utils.units.getUnitsLabel("heartrate")).to.equal("bpm");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace")).to.equal("min/mi");
            });

            it("should return the unit label for pace for rowing workouts", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace", 12)).to.equal("sec/100m");
            });

            it("should return the unit label for cadence", function()
            {
                expect(TP.utils.units.getUnitsLabel("cadence")).to.equal("rpm");
            });

            it("should return the unit label for torque", function()
            {
                expect(TP.utils.units.getUnitsLabel("torque")).to.equal("in-lbs");
            });

            it("shouuld return the unit label for elevation", function()
            {
                expect(TP.utils.units.getUnitsLabel("elevation")).to.equal("ft");
            });

            it("should return the unit label for power", function()
            {
                expect(TP.utils.units.getUnitsLabel("power")).to.equal("W");
            });

            it("should throw an exception if an uknown value type is requested", function()
            {
                expect(function() { TP.utils.units.getUnitsLabel("unknown"); }).to.throw();
            });
        });

        describe("convertToViewUnits template helper", function()
        {

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should throw an exception when trying to convert for an unknown value type", function()
            {
                expect(function() { convertToViewUnits(1234, "unknownType"); }).to.throw();
            });


            it("should convert an elevation in meters to ft", function()
            {
                expect(convertToViewUnits(0, "elevation")).to.equal(0);
                expect(convertToViewUnits(1000, "elevation")).to.be.closeTo(3281, Math.pow(10, -0) / 2);
                expect(convertToViewUnits(1000000, "elevation")).to.be.closeTo(3280840, Math.pow(10, -0) / 2);
                expect(convertToViewUnits(-1000, "elevation")).to.be.closeTo(-3281, Math.pow(10, -0) / 2);
            });

            it("should convert a pace value in meters per second to min/mile, properly formated", function()
            {
                expect(convertToViewUnits(1, "pace")).to.equal("26:49");
                expect(convertToViewUnits(3, "pace")).to.equal("08:56");
                expect(convertToViewUnits("notAnumber", "pace")).to.equal(0);
                expect(convertToViewUnits(0.0005, "pace")).to.equal("99:59:59.99");
                expect(convertToViewUnits(-1, "pace")).to.equal("99:59:59.99");
            });

            it("Should convert temperatures", function()
            {
                expect(convertToViewUnits(0, "temperature")).to.equal(32);
                expect(convertToViewUnits(100, "temperature")).to.equal(212);
            });

            it("should convert and format efficiency factor values for run", function()
            {
                expect(convertToViewUnits(0.016512562392295274, "efficiencyfactor", null, 3)).to.be.closeTo(1.08, Math.pow(10, -2) / 2);
            });
 
            it("should format efficiency factor values for other sport types", function()
            {
                expect(convertToViewUnits(0.016512562392295274, "efficiencyfactor", null, 10)).to.be.closeTo(0.02, Math.pow(10, -2) / 2);
            });           
        });

        describe("convertToModelUnits template helper", function()
        {

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should throw an exception when trying to convert for an unknown value type", function ()
            {
                expect(function () { convertToModelUnits(1234, "unknownType"); }).to.throw();
            });


            it("should convert an elevation in ft to meters", function ()
            {
                expect(convertToModelUnits(0, "elevation")).to.equal(0);
                expect(convertToModelUnits(3281, "elevation")).to.be.closeTo(1000, Math.pow(10, -0) / 2);
                expect(convertToModelUnits(3280840, "elevation")).to.be.closeTo(1000000, Math.pow(10, -0) / 2);
                expect(convertToModelUnits(-3281, "elevation")).to.be.closeTo(-1000, Math.pow(10, -0) / 2);
            });

            it("should convert a pace value in min/mile to meters per second", function ()
            {
                expect(convertToModelUnits("26:49", "pace")).to.be.closeTo(1, Math.pow(10, -2) / 2);
                expect(convertToModelUnits("08:56", "pace")).to.be.closeTo(3, Math.pow(10, -0) / 2);
                expect(convertToModelUnits("99:99", "pace")).to.be.closeTo(0.266, Math.pow(10, -3) / 2);
            });

            it("Should convert temperatures", function()
            {
                expect(convertToModelUnits(32, "temperature")).to.equal(0);
                expect(convertToModelUnits(212, "temperature")).to.equal(100);
            });
        });

        describe("TP.utils.units.getUnitsLabel, for swim workouts in english units", function()
        {

            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });


            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace", swimTypeId)).to.equal("sec/100y");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace", swimTypeId)).to.equal("sec/100y");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed", swimTypeId)).to.equal("yds/min");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace", swimTypeId)).to.equal("sec/100y");
            });

        });

        describe("TP.utils.units.getUnitsLabel, for swim workouts in metric units", function()
        {

            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });


            it("should return the unit label for normalized pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("normalizedPace", swimTypeId)).to.equal("sec/100m");
            });

            it("should return the unit label for averagePace", function()
            {
                expect(TP.utils.units.getUnitsLabel("averagePace", swimTypeId)).to.equal("sec/100m");
            });

            it("should return the unit label for average speed", function()
            {
                expect(TP.utils.units.getUnitsLabel("averageSpeed", swimTypeId)).to.equal("m/min");
            });

            it("should return the unit label for pace", function()
            {
                expect(TP.utils.units.getUnitsLabel("pace", swimTypeId)).to.equal("sec/100m");
            });

        });

        describe("convertToViewUnits template helper, for swim workouts in english units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a pace value in meters per second to sec/100y, properly formated", function()
            {
                expect(convertToViewUnits(1, "pace", undefined, swimTypeId)).to.equal("01:31");
                expect(convertToViewUnits(5, "pace", undefined, swimTypeId)).to.equal("00:18");

            });
            
        });

        describe("convertToViewUnits template helper, for swim workouts in metric units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a pace value in meters per second to sec/100m, properly formated", function()
            {
                expect(convertToViewUnits(1, "pace", undefined, swimTypeId)).to.equal("01:40");
                expect(convertToViewUnits(5, "pace", undefined, swimTypeId)).to.equal("00:20");

            });
            
        });

        describe("convertToViewUnits template helper, for rowing workouts (always in metric units)", function()
        {
            it("should convert a pace value in meters per second to sec/100m, properly formated", function()
            {
                expect(convertToViewUnits(1, "pace", undefined, 12)).to.equal("01:40");
                expect(convertToViewUnits(5, "pace", undefined, 12)).to.equal("00:20");
            });
        });

        describe("convertToModelUnits template helper, for swim workouts in english units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");
 
            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a pace value in sec/100y to meters per second", function()
            {
                expect(convertToModelUnits("01:31", "pace", swimTypeId)).to.be.closeTo(1, Math.pow(10, -0) / 2);
                expect(convertToModelUnits("00:18", "pace", swimTypeId)).to.be.closeTo(5, Math.pow(10, -0) / 2);

            });
 
        });

        describe("convertToModelUnits template helper, for rowing workouts in all units", function()
        {
 
            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.English);
            });

            afterEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a pace value in sec/100m to m/s, properly formated", function()
            {
                expect(convertToModelUnits("01:40", "pace", 12)).to.be.closeTo(1, Math.pow(10, -0) / 2);
                expect(convertToModelUnits("00:20", "pace", 12)).to.be.closeTo(5, Math.pow(10, -0) / 2);
            });
 
        });


        describe("convertToModelUnits template helper, for swim workouts in metric units", function()
        {
            var swimTypeId = TP.utils.workout.types.getIdByName("Swim");

            beforeEach(function()
            {
                testHelpers.theApp.user.set("units", TP.utils.units.constants.Metric);
            });

            it("should convert a pace value in meters per second to sec/100m, properly formated", function()
            {
                expect(convertToModelUnits("01:40", "pace", swimTypeId)).to.be.closeTo(1, Math.pow(10, -0) / 2);
                expect(convertToModelUnits("00:20", "pace", swimTypeId)).to.be.closeTo(5, Math.pow(10, -0) / 2);

            });
            
        });
    });
});
