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
                expect(datetimeUtils.isThisWeek(moment())).to.equal(true);
            });

            it("should return false for last week", function()
            {
                expect(datetimeUtils.isThisWeek(moment().add("weeks", -1))).to.equal(false);
            });

            it("should return false for next year", function()
            {
                expect(datetimeUtils.isThisWeek(moment().add("years", 1))).to.equal(false);
            });

        });

        describe("convert", function()
        {
            describe("timeToDecimalHours", function()
            {

                it("Should return 0 for invalid numbers", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("x")).to.equal(0);
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
                        expect(datetimeUtils.convert.timeToDecimalHours(timeString)).to.eql(times[timeString]);
                    }

                });

                it("Should treat integers 1-9 as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1")).to.eql(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("3")).to.eql(3);
                    expect(datetimeUtils.convert.timeToDecimalHours("9")).to.eql(9);
                });

                it("Should treat integers 1-9 as minutes if assumeHours is false", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1", { assumeHours: false })).to.eql(1 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("3", { assumeHours: false })).to.eql(3 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("9", { assumeHours: false })).to.eql(9 / 60);
                });

                it("Should treat integers 1-9 as seconds if assumeSeconds is true", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1", { assumeHours: false, assumeSeconds: true })).to.eql((1/60)/60);
                    expect(datetimeUtils.convert.timeToDecimalHours("3", { assumeHours: false, assumeSeconds: true })).to.eql((3/60)/60);
                    expect(datetimeUtils.convert.timeToDecimalHours("9", { assumeHours: false, assumeSeconds: true })).to.eql((9/60)/60);
                });

                it("Should treat integers greater than 9 as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10")).to.eql(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("12")).to.eql(0.2);
                    expect(datetimeUtils.convert.timeToDecimalHours("30")).to.eql(0.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("60")).to.eql(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("90")).to.eql(1.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("75")).to.eql(1.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("120")).to.eql(2);
                });

                it("Should treat integers greater than 9 as seconds if assumeSeconds is true", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10", { assumeHours: false, assumeSeconds: true }).toFixed(5)).to.eql(((10 / 60)/60).toFixed(5));
                    expect(datetimeUtils.convert.timeToDecimalHours("12", { assumeHours: false, assumeSeconds: true })).to.eql((12 / 60)/60);
                    expect(datetimeUtils.convert.timeToDecimalHours("30", { assumeHours: false, assumeSeconds: true })).to.eql((30 / 60)/60);
                    expect(datetimeUtils.convert.timeToDecimalHours("60", { assumeHours: false, assumeSeconds: true }).toFixed(5)).to.eql((1/60).toFixed(5));
                    expect(datetimeUtils.convert.timeToDecimalHours("90", { assumeHours: false, assumeSeconds: true }).toFixed(5)).to.eql((1.5/60).toFixed(5));
                    expect(datetimeUtils.convert.timeToDecimalHours("75", { assumeHours: false, assumeSeconds: true }).toFixed(5)).to.eql((1.25/60).toFixed(5));
                    expect(datetimeUtils.convert.timeToDecimalHours("120", { assumeHours: false, assumeSeconds: true })).to.eql(2/60);
                });

                it("Should treat hh:mm values less than 10:00 as hours and minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1:12")).to.eql(1.2);
                    expect(datetimeUtils.convert.timeToDecimalHours("3:30")).to.eql(3.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("0:30")).to.eql(0.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("9:48")).to.eql(9.8);
                });

                it("Should treat mm:ss values less than 10:00 as minutes and seconds if assumeHours is false", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1:12", { assumeHours: false })).to.be.closeTo(1.2 / 60, Math.pow(10, -2) / 2);
                    expect(datetimeUtils.convert.timeToDecimalHours("3:30", { assumeHours: false })).to.be.closeTo(3.5 / 60, Math.pow(10, -2) / 2);
                    expect(datetimeUtils.convert.timeToDecimalHours("0:30", { assumeHours: false })).to.be.closeTo(0.5 / 60, Math.pow(10, -2) / 2);
                    expect(datetimeUtils.convert.timeToDecimalHours("9:48", { assumeHours: false })).to.be.closeTo(9.8 / 60, Math.pow(10, -2) / 2);
                });

                it("Should treat mm:ss values greater than or equal to 10:00 as minutes and seconds", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10:00")).to.eql(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:00")).to.eql(0.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:30")).to.eql(0.25 + (30 / 60 / 60));
                    expect(datetimeUtils.convert.timeToDecimalHours("29:48")).to.be.closeTo(0.5, Math.pow(10, -2) / 2);
                    expect(datetimeUtils.convert.timeToDecimalHours("139:48")).to.be.closeTo(2.33, Math.pow(10, -2) / 2);
                });

                it("Should treat decimals less than ten as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("0.29")).to.eql(0.29);
                    expect(datetimeUtils.convert.timeToDecimalHours(".9")).to.eql(0.9);
                    expect(datetimeUtils.convert.timeToDecimalHours("1.234")).to.eql(1.234);
                    expect(datetimeUtils.convert.timeToDecimalHours("5.5")).to.eql(5.5);
                });

                it("Should treat decimals greater than ten as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10.0")).to.eql(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("10.5")).to.eql(10.5 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("100.37")).to.eql(100.37 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("30.25")).to.eql(30.25 / 60);
                });

                it("Should treat single colon prefixed strings (:xx) as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours(":10")).to.eql(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":20")).to.eql(20 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":100")).to.eql(100 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":240")).to.eql(4);
                    expect(datetimeUtils.convert.timeToDecimalHours(":5")).to.eql(5 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours(":12")).to.eql(0.2);
                });

                it("Should treat double colon prefixed strings (::xx) as seconds", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("::10")).to.eql(10 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::20")).to.eql(20 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::100")).to.eql(100 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::240")).to.eql(4 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("::5")).to.eql(5 / 3600);
                    expect(datetimeUtils.convert.timeToDecimalHours("::12")).to.eql(12 / 3600);
                });

                it("Should treat double colon suffixed strings (xx::) as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10::")).to.eql(10);
                    expect(datetimeUtils.convert.timeToDecimalHours("1::")).to.eql(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("9::")).to.eql(9);
                    expect(datetimeUtils.convert.timeToDecimalHours("20::")).to.eql(20);
                    expect(datetimeUtils.convert.timeToDecimalHours("90::")).to.eql(90);
                });

                it("Should treat single colon suffixed strings less than 10 (x:) as hours", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("1:")).to.eql(1);
                    expect(datetimeUtils.convert.timeToDecimalHours("9:")).to.eql(9);
                });

                it("Should treat single colon suffixed strings 10 and greater (xx:) as minutes", function()
                {
                    expect(datetimeUtils.convert.timeToDecimalHours("10:")).to.eql(10 / 60);
                    expect(datetimeUtils.convert.timeToDecimalHours("15:")).to.eql(0.25);
                    expect(datetimeUtils.convert.timeToDecimalHours("90:")).to.eql(1.5);
                    expect(datetimeUtils.convert.timeToDecimalHours("120:")).to.eql(2);
                });
            });
        });
    });
});
