requirejs(
[
    "utilities/conversion"
],
function(conversion)
{
    describe("convertTimeHoursToDecimal", function()
    {

        it("Should return 0 for invalid numbers", function()
        {
            expect(conversion.convertTimeHoursToDecimal("x")).toBe(0);
        });

        it("Should return valid times", function()
        {
            var times = {
                "0:30": 0.5,
                "30": 30,
                "1:15": 1.25,
                "1:30": 1.5
            };

            for (var timeString in times)
            {
                expect(conversion.convertTimeHoursToDecimal(timeString)).toEqual(times[timeString]);
            }

        });
    });
});