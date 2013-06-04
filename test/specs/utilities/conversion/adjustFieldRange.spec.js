requirejs(
[
    "utilities/conversion/adjustFieldRange"
],
function(adjustFieldRange)
{
    describe("Adjust Field Range", function()
    {

        it("Should return if the value is not a number", function()
        {
            var nan = Number("x");
            var undef = undefined;
            expect(isNaN(adjustFieldRange(nan, "duration"))).toBeTruthy();
            expect(adjustFieldRange(undef, "duration")).toBe(undef);
        });

        it("Should return if the field type is not valid", function()
        {
            var value = 53;
            var fieldType = 'unknown';
            expect(adjustFieldRange(value, fieldType)).toBe(value);
        });

        describe("Duration", function()
        {
            it("Should not allow values less than zero", function()
            {
                var tooLow = -10;
                expect(adjustFieldRange(tooLow, 'duration')).toEqual(0);
            });

            it("Should not allow values greater than 99:59:00", function()
            {
                var tooHigh = 100;
                expect(adjustFieldRange(tooHigh, 'duration')).toEqual(99 + (59/60));
            });

            it("Should allow values within range", function()
            {
                var withinRange = 55.23;
                expect(adjustFieldRange(withinRange, 'duration')).toBe(withinRange);
            });

            it("Should allow values at the very top of the range", function ()
            {
                var topOfRange = 99 + (59 / 60);
                expect(adjustFieldRange(topOfRange, 'duration')).toBe(topOfRange);
            });

            it("Should allow values at the very bottom of the range", function ()
            {
                var bottomOfRange = 0;
                expect(adjustFieldRange(bottomOfRange, 'duration')).toBe(bottomOfRange);
            });
        });

        describe("Pace", function ()
        {
            it("Should not allow values less then zero", function ()
            {
                var toLow = -10;
                expect(adjustFieldRange(toLow, 'pace')).toEqual(0);
            });
        });


    });
});