requirejs(
[
    "utilities/datetime/datetime"
],
function(datetimeUtils)
{
    describe("datetime", function()
    {
        describe("convert", function()
        {
            describe("timeStringToDecimalHours", function()
            {

                it("Should return 0 for invalid numbers", function()
                {
                    expect(datetimeUtils.convert.timeStringToDecimalHours("x")).toBe(0);
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
                        expect(datetimeUtils.convert.timeStringToDecimalHours(timeString)).toEqual(times[timeString]);
                    }

                });
            });
        });
    });
});