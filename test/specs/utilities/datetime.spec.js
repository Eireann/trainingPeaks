requirejs(
[
    "moment",
    "utilities/datetime/datetime"
],
function(moment, datetimeUtils)
{
    describe("datetime", function()
    {
        describe("isThisWeek", function()
        {
            it("should return true for today", function()
            {
                expect(datetimeUtils.isThisWeek(moment())).toBe(true);
            });

            it("should return false for last week", function()
            {
                expect(datetimeUtils.isThisWeek(moment().add("weeks", -1))).toBe(false);
            });

            it("should return false for next year", function()
            {
                expect(datetimeUtils.isThisWeek(moment().add("years", 1))).toBe(false);
            });

        });

        describe("convert", function()
        {
            describe("timeToDecimalHours", function()
            {

                it("Should return 0 for invalid numbers", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("x")).toBe(0);
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
                        expect(datetimeUtils.convert.timeToDecimalHours(timeString)).toEqual(times[timeString]);
                    }

                });
            });
        });
    });
});