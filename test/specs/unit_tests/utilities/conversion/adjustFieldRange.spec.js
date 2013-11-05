requirejs(
[
    "utilities/conversion/adjustFieldRange"
],
function(adjustFieldRange)
{


    var describeRange = function(key, min, max)
    {
        it("Should not allow values less than minimum " + min, function()
        {
            var tooLow = (min > 0) ? min / 2 : min - 1;
            expect(adjustFieldRange(tooLow, key)).to.eql(min);
        });

        it("Should not allow values greater than max " + max, function()
        {
            var tooHigh = max + 1;
            expect(adjustFieldRange(tooHigh, key)).to.eql(max);
        });

        it("Should allow values between min " + min + " and max " + max, function()
        {
            var withinRange = (min + max) / 2;
            expect(adjustFieldRange(withinRange, key)).to.equal(withinRange);
        });

        it("Should allow values at the very top of the range " + max, function()
        {
            expect(adjustFieldRange(max, key)).to.equal(max);
        });

        it("Should allow values at the very bottom of the range " + min, function()
        {
            expect(adjustFieldRange(min, key)).to.equal(min);
        });
    };

    describe("Adjust Field Range", function()
    {

        it("Should return if the value is not a number", function()
        {
            var nan = Number("x");
            expect(isNaN(adjustFieldRange(nan, "duration"))).to.be.ok;
            expect(isNaN(adjustFieldRange(undefined, "duration"))).to.be.ok;
        });

        it("Should return if the field type is not valid", function()
        {
            var value = 53;
            var fieldType = 'unknown';
            expect(adjustFieldRange(value, fieldType)).to.equal(value);
        });

        describe("Duration", function()
        {
            var maxDuration = 99 + (59 / 60) + (59 / 3600);
            var minDuration = 0;
            describeRange("duration", minDuration, maxDuration);
        });

        describe("Distance", function()
        {
            var maxDistance = 999999;
            var minDistance = 0;
            describeRange("distance", minDistance, maxDistance);
        });

        describe("Speed", function()
        {
            var maxSpeed = 999;
            var minSpeed = 0;
            describeRange("speed", minSpeed, maxSpeed);
        });

        describe("Pace", function()
        {
            var maxPace = 99 + (59 / 60) + (59 / 3600);
            var minPace = 1 / 3600;
            describeRange("pace", minPace, maxPace);
        });

        describe("calories", function()
        {
            var maxCalories = 99999;
            var minCalories = 0;
            describeRange("calories", minCalories, maxCalories);
        });

        describe("elevationGain", function()
        {
            var maxElevationGain = 99999;
            var minElevationGain = 0;
            describeRange("elevationGain", minElevationGain, maxElevationGain);
        });

        describe("elevationLoss", function()
        {
            var maxElevationLoss = 99999;
            var minElevationLoss = 0;
            describeRange("elevationLoss", minElevationLoss, maxElevationLoss);
        });

        describe("elevation", function()
        {
            var maxElevationAvg = 99999;
            var minElevationAvg = -15000;
            describeRange("elevation", minElevationAvg, maxElevationAvg);
        });

        describe("TSS", function()
        {
            var minTss = 0;
            var maxTss = 9999;
            describeRange("TSS", minTss, maxTss);
        });

        describe("IF", function()
        {
            var minIf = 0;
            var maxIf = 99;
            describeRange("IF", minIf, maxIf);
        });

        describe("Energy", function()
        {
            var minEnergy = 0;
            var maxEnergy = 99999;
            describeRange("energy", minEnergy, maxEnergy);
        });

        describe("Heart Rate", function()
        {
            var minHR = 0;
            var maxHR = 255;
            describeRange("heartrate", minHR, maxHR);
        });

        describe("Power", function()
        {
            var minPower = 0;
            var maxPower = 9999;
            describeRange("power", minPower, maxPower);
        });

        describe("Torque", function()
        {
            var minTorque = 0;
            var maxTorque = 9999;
            describeRange("torque", minTorque, maxTorque);
        });

        describe("Cadence", function()
        {
            var minCadence = 0;
            var maxCadence = 255;
            describeRange("cadence", minCadence, maxCadence);
        });

        describe("Temperature", function()
        {
            var minTemp = -999;
            var maxTemp = 999;
            describeRange("temp", minTemp, maxTemp);
        });

    });

});
