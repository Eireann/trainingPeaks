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
                        "30": 0.5,
                        "1:15": 1.25,
                        "1:30": 1.5
                    };

                    for (var timeString in times)
                    {
                        expect(datetimeUtils.convert.timeToDecimalHours(timeString)).toEqual(times[timeString]);
                    }

                });

                it("Should treat integers 1-9 as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1")).toEqual(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("3")).toEqual(3);
                    expect(datetimeUtils.convert.timeToDecimalHours("9")).toEqual(9);
                });

                it("Should treat integers greater than 9 as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10")).toEqual(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("12")).toEqual(0.2);
                    expect(datetimeUtils.convert.timeToDecimalHours("30")).toEqual(0.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("60")).toEqual(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("90")).toEqual(1.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("75")).toEqual(1.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("120")).toEqual(2);
                });

                it("Should treat hh:mm values less than 10:00 as hours and minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1:12")).toEqual(1.2);
                    expect(datetimeUtils.convert.timeToDecimalHours("3:30")).toEqual(3.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("0:30")).toEqual(0.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("9:48")).toEqual(9.8);
                });

                it("Should treat mm:ss values greater than or equal to 10:00 as minutes and seconds", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10:00")).toEqual(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:00")).toEqual(0.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:30")).toEqual(0.25 + (30 / 60 / 60));
                    expect(datetimeUtils.convert.timeToDecimalHours("29:48")).toBeCloseTo(0.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("139:48")).toBeCloseTo(2.33);
                });

                it("Should treat decimals less than ten as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("0.29")).toEqual(0.29);
                    expect(datetimeUtils.convert.timeToDecimalHours(".9")).toEqual(0.9);
                    expect(datetimeUtils.convert.timeToDecimalHours("1.234")).toEqual(1.234);
                    expect(datetimeUtils.convert.timeToDecimalHours("5.5")).toEqual(5.5);
                });

                it("Should treat decimals greater than ten as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10.0")).toEqual(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("10.5")).toEqual(10.5 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("100.37")).toEqual(100.37 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("30.25")).toEqual(30.25 / 60);
                });

                it("Should treat single colon prefixed strings (:xx) as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours(":10")).toEqual(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":20")).toEqual(20 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":100")).toEqual(100 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":240")).toEqual(4);
                    expect(datetimeUtils.convert.timeToDecimalHours(":5")).toEqual(5 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":12")).toEqual(0.2);
                });

                it("Should treat double colon prefixed strings (::xx) as seconds", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("::10")).toEqual(10 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::20")).toEqual(20 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::100")).toEqual(100 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::240")).toEqual(4 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("::5")).toEqual(5 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::12")).toEqual(12 / 3600);
                });

                it("Should treat double colon suffixed strings (xx::) as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10::")).toEqual(10);
                    expect(datetimeUtils.convert.timeToDecimalHours("1::")).toEqual(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("9::")).toEqual(9);
                    expect(datetimeUtils.convert.timeToDecimalHours("20::")).toEqual(20);
                    expect(datetimeUtils.convert.timeToDecimalHours("90::")).toEqual(90);
                });

                it("Should treat single colon suffixed strings less than 10 (x:) as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1:")).toEqual(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("9:")).toEqual(9);
                });

                it("Should treat single colon suffixed strings 10 and greater (xx:) as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10:")).toEqual(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:")).toEqual(0.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("90:")).toEqual(1.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("120:")).toEqual(2);
                });
            });
        });
    });
});