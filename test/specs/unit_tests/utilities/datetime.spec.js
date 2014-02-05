define(
[
    "moment",
    "utilities/datetime/datetime"
],
function(moment, datetimeUtils)
{
    var ONE_DAY_IN_MILLISECONDS = 24 * 3600 * 1000;

    // So that we don't validate "moment" using "moment"
    Date.prototype.format = function(format)
    {
        var formatSpecifiers =
        {
            "M+": this.getMonth() + 1,
            "D+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "S": this.getMilliseconds()
        };

        if (/(Y+)/.test(format))
        {
            format = format.replace(
                RegExp.$1,
                (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }

        for (var k in formatSpecifiers)
        {
            if (new RegExp("("+ k +")").test(format))
            {
                format = format.replace(
                    RegExp.$1,
                    RegExp.$1.length === 1 ? formatSpecifiers[k] : ("00" + formatSpecifiers[k]).substr(("" + formatSpecifiers[k]).length));
            }
        }
        
        return format;
    };

    describe("datetime", function()
    {
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

        describe("getTodayDate", function()
        {
            it("should return today's date as a local start-of-day date", function()
            {
                // This will return a local date, based on the browser's time zone
                var jsDate = new Date();

                expect(datetimeUtils.getTodayDate().format("MM/DD/YYYY hh:mm:ss")).to.equal(jsDate.format("MM/DD/YYYY 12:00:00"));
            });
        });

        describe("getThisWeekStartDate", function()
        {
            it("should return the first day of the week as a local start-of-day date", function()
            {
                var jsDate = new Date();

                while (jsDate.getDay() > 1)
                {
                    // Move back 1 day
                    jsDate = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);
                }

                expect(datetimeUtils.getThisWeekStartDate().format("MM/DD/YYYY hh:mm:ss")).to.equal(jsDate.format("MM/DD/YYYY 12:00:00"));
            });
        });

        describe("isThisWeek", function()
        {
            it("should return 'true' for today", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isThisWeek(jsDate.format("MM/DD/YYYY"))).to.equal(true);
            });
            it("should return 'true' for the first day of this week", function()
            {
                var jsDate = new Date();

                while (jsDate.getDay() > 1)
                {
                    // Move back 1 day
                    jsDate = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);
                }

                expect(datetimeUtils.isThisWeek(jsDate.format("MM/DD/YYYY"))).to.equal(true);
            });
            it("should return 'true' for the last day of this week", function()
            {
                var jsDate = new Date();

                while (jsDate.getDay() < 6)
                {
                    // Move ahead 1 day
                    jsDate = new Date(jsDate.getTime() + ONE_DAY_IN_MILLISECONDS);
                }

                expect(datetimeUtils.isThisWeek(jsDate.format("MM/DD/YYYY"))).to.equal(true);
            });
            it("should return 'false' for the day before this Monday", function()
            {
                var jsDate = new Date();

                // If we are Sunday, we want to test against the previous Sunday
                if (jsDate.getDay() === 0)
                {
                    // Move back 1 day
                    jsDate = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);
                }

                while (jsDate.getDay() !== 0)
                {
                    // Move back 1 day
                    jsDate = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);
                }

                expect(datetimeUtils.isThisWeek(jsDate.format("MM/DD/YYYY"))).to.equal(false);
            });
            it("should return 'false' for the day after this Sunday", function()
            {
                var jsDate = new Date();

                // If we are Monday, we want to test against the next Monday
                if (jsDate.getDay() === 1)
                {
                    // Move ahead 1 day
                    jsDate = new Date(jsDate.getTime() + ONE_DAY_IN_MILLISECONDS);
                }

                while (jsDate.getDay() !== 1)
                {
                    // Move ahead 1 day
                    jsDate = new Date(jsDate.getTime() + ONE_DAY_IN_MILLISECONDS);
                }

                expect(datetimeUtils.isThisWeek(jsDate.format("MM/DD/YYYY"))).to.equal(false);
            });
            it("should return 'false' if the specified date is 2 weeks ago", function()
            {
                var jsDate = new Date();

                var twoWeeksAgo = new Date(jsDate.getTime() - 14 * ONE_DAY_IN_MILLISECONDS).format("MM/DD/YYYY");

                expect(datetimeUtils.isThisWeek(twoWeeksAgo)).to.equal(false);
            });
            it("should return 'false' if the specified date is 2 weeks in the future", function()
            {
                var jsDate = new Date();

                var twoWeeksAgo = new Date(jsDate.getTime() + 14 * ONE_DAY_IN_MILLISECONDS).format("MM/DD/YYYY");

                expect(datetimeUtils.isThisWeek(twoWeeksAgo)).to.equal(false);
            });
            it("should return 'false' if the specified date is 7 days ago", function()
            {
                var jsDate = new Date();

                var twoWeeksAgo = new Date(jsDate.getTime() - 7 * ONE_DAY_IN_MILLISECONDS).format("MM/DD/YYYY");

                expect(datetimeUtils.isThisWeek(twoWeeksAgo)).to.equal(false);
            });
            it("should return 'false' if the specified date is 7 days in the future", function()
            {
                var jsDate = new Date();

                var twoWeeksAgo = new Date(jsDate.getTime() + 7 * ONE_DAY_IN_MILLISECONDS).format("MM/DD/YYYY");

                expect(datetimeUtils.isThisWeek(twoWeeksAgo)).to.equal(false);
            });
        });

        describe("isToday", function()
        {
            it("should return 'true' for today's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isToday(jsDate.format("MM/DD/YYYY 12:00:00"))).to.equal(true);
            });
            it("should return 'true' for today's date formated as 'MM/DD/YYYY'", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isToday(jsDate.format("MM/DD/YYYY"))).to.equal(true);
            });
            it("should return 'true' for today's date formated using JavaScript's default format", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isToday(jsDate.toString())).to.equal(true);
            });
        });

        describe("isPast", function()
        {
            it("should return 'false' for today's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isPast(jsDate.format("MM/DD/YYYY 12:00:00"))).to.equal(false);
            });
            it("should return 'false' for tomorrow's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                var tomorrow = new Date(jsDate.getTime() + ONE_DAY_IN_MILLISECONDS);

                expect(datetimeUtils.isPast(tomorrow.format("MM/DD/YYYY 12:00:00"))).to.equal(false);
            });
            it("should return 'true' for yesterday's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                var yesterday = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);

                expect(datetimeUtils.isPast(yesterday.format("MM/DD/YYYY 12:00:00"))).to.equal(true);
            });
        });

        describe("isFuture", function()
        {
            it("should return 'false' for today's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                expect(datetimeUtils.isFuture(jsDate.format("MM/DD/YYYY 12:00:00"))).to.equal(false);
            });
            it("should return 'false' for yesterday's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                var yesterday = new Date(jsDate.getTime() - ONE_DAY_IN_MILLISECONDS);

                expect(datetimeUtils.isFuture(yesterday.format("MM/DD/YYYY 12:00:00"))).to.equal(false);
            });
            it("should return 'true' for tomorrow's date as a local start-of-day date", function()
            {
                var jsDate = new Date();

                var tomorrow = new Date(jsDate.getTime() + ONE_DAY_IN_MILLISECONDS);

                expect(datetimeUtils.isFuture(tomorrow.format("MM/DD/YYYY 12:00:00"))).to.equal(true);
            });
        });
    });
});
