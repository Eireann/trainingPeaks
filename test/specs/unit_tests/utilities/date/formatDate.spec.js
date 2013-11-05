requirejs(
[
    "moment",
    "testUtils/testHelpers",
    "TP"
],
function(moment, testHelpers, TP)
{
    describe("TP.utils.datetime.format", function()
    {

        it("Should print a formated date from a unix epoch integer", function()
        {
            var unixEpoch = 946710000000; // 01/01/2000T00:00:00 MST

            expect(TP.utils.datetime.format(unixEpoch, "YYYY/DD/MM")).to.equal("2000/01/01");
            expect(TP.utils.datetime.format(unixEpoch, "YY/DD/MM")).to.equal("00/01/01");
        });

        it("Should convert dash separator to slashes", function()
        {
            var unixEpoch = 946710000000; // 01/01/2000T00:00:00 MST
            expect(TP.utils.datetime.format(unixEpoch, "MM-DD-YYYY")).to.equal("01/01/2000");
        });

        it("Should not remove dashes on date formats that begin with YY", function()
        {
            var testDate = "Apr 1, 2019";
            expect(TP.utils.datetime.format(testDate, "YYYY-MM-DD")).to.equal("2019-04-01");
            expect(TP.utils.datetime.format(testDate, "YY-MM-DD")).to.equal("19-04-01");
        });

        describe("mdy", function()
        {
            beforeEach(function()
            {
                testHelpers.theApp.user.set("dateFormat", "mdy");
            });

            it("Should format dates as M/D/YYYY by default", function()
            {
                var testDate = "April 1, 2020";
                expect(TP.utils.datetime.format(testDate)).to.equal("4/1/2020");
            });

            describe("calendarDay", function()
            {
                it("Should print a formatted year, month, and day on the first of the year if no format is passed", function()
                {
                    var testDate = "Jan 1, 2013";
                    expect(TP.utils.datetime.format(testDate, "calendarDay")).to.equal("Jan 1 2013");
                });

                it("Should print a formatted month and day on the first of the month if no format is passed", function()
                {
                    var testDate = "Feb 1, 2013";
                    expect(TP.utils.datetime.format(testDate, "calendarDay")).to.equal("Feb 1");
                });
            });

            describe("Convert dmy to mdy", function()
            {
                var testDate = "April 1, 2019";

                it("Should preserve MM/DD/YYYY as MM/DD/YYYY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "MM/DD/YYYY")).to.equal("04/01/2019");
                });

                it("Should reorder DD/MM/YYYY to MM/DD/YYYY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "DD/MM/YYYY")).to.equal("04/01/2019");
                });

                it("Should not reorder date formats that don't have both a month and a day format", function()
                {
                    expect(TP.utils.datetime.format(testDate, "DD YYYY")).to.equal("01 2019");
                    expect(TP.utils.datetime.format(testDate, "MM YYYY")).to.equal("04 2019");
                    expect(TP.utils.datetime.format(testDate, "MMM YYYY")).to.equal("Apr 2019");
                });

                it("Should not reorder date formats that begin with YY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "YYYY-MM-DD")).to.equal("2019-04-01");
                    expect(TP.utils.datetime.format(testDate, "YY-MM-DD")).to.equal("19-04-01");
                });

                it("Should preserve other formatting", function()
                {
                    expect(TP.utils.datetime.format(testDate, "dddd, MMM D, YYYY")).to.equal("Monday, Apr 1, 2019");
                    expect(TP.utils.datetime.format(testDate, "dddd DD MMM, YYYY")).to.equal("Monday Apr 01, 2019");
                    expect(TP.utils.datetime.format("2013-01-01T19:13:00", "h:mm a")).to.equal("7:13 pm");
                });

                it("Should support L and LT formats", function()
                {
                    expect(TP.utils.datetime.format("2013-04-01T19:13:00", "ddd, L LT")).to.equal("Mon, 4/1/2013 7:13 pm");
                });

            });

            describe("Parse", function()
            {

                it("Should return a moment", function()
                {
                    var d = TP.utils.datetime.parse("1/4/2013");
                    expect(moment.isMoment(d)).to.be.ok;
                });

                it("Should parse dates as M/D/Y by default", function()
                {
                    var d = TP.utils.datetime.parse("4/1/2013");
                    expect(d.format("YYYY-MM-DD")).to.equal("2013-04-01");
                });

                it("Should parse formatted dates", function()
                {
                    var d = TP.utils.datetime.parse("Apr 1, 2013", "MMM D, YYYY");
                    expect(d.format("YYYY-MM-DD")).to.equal("2013-04-01");
                });
            });
        });

        describe("dmy", function()
        {
            beforeEach(function()
            {
                testHelpers.theApp.user.set("dateFormat", "dmy");
            });

            it("Should format dates as D/M/YYYY by default", function()
            {
                var testDate = "April 1, 2020";
                expect(TP.utils.datetime.format(testDate)).to.equal("1/4/2020");
            });

            describe("calendarDay", function()
            {
                it("Should print a formatted year, month, and day on the first of the year if no format is passed", function()
                {
                    var testDate = "Jan 1, 2013";
                    expect(TP.utils.datetime.format(testDate, "calendarDay")).to.equal("1 Jan 2013");
                });

                it("Should print a formatted month and day on the first of the month if no format is passed", function()
                {
                    var testDate = "Feb 1, 2013";
                    expect(TP.utils.datetime.format(testDate, "calendarDay")).to.equal("1 Feb");
                });
            });

            describe("Convert mdy to dmy", function()
            {
                var testDate = "April 1, 2019";

                it("Should preserve DD/MM/YYYY to DD/MM/YYYY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "DD/MM/YYYY")).to.equal("01/04/2019");
                });

                it("Should reorder MM/DD/YYYY to DD/MM/YYYY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "MM/DD/YYYY")).to.equal("01/04/2019");
                });

                it("Should not reorder date formats that don't have both a month and a day format", function()
                {
                    expect(TP.utils.datetime.format(testDate, "DD YYYY")).to.equal("01 2019");
                    expect(TP.utils.datetime.format(testDate, "MM YYYY")).to.equal("04 2019");
                    expect(TP.utils.datetime.format(testDate, "MMM YYYY")).to.equal("Apr 2019");
                });

                it("Should not reorder date formats that begin with YY", function()
                {
                    expect(TP.utils.datetime.format(testDate, "YYYY-MM-DD")).to.equal("2019-04-01");
                    expect(TP.utils.datetime.format(testDate, "YY-MM-DD")).to.equal("19-04-01");
                });

                it("Should preserve other formatting", function()
                {
                    expect(TP.utils.datetime.format(testDate, "dddd, MMM D, YYYY")).to.equal("Monday, 1 Apr, 2019");
                    expect(TP.utils.datetime.format(testDate, "dddd DD MMM, YYYY")).to.equal("Monday 01 Apr, 2019");
                    expect(TP.utils.datetime.format("2013-01-01T19:13:00", "h:mm a")).to.equal("7:13 pm");
                });

                it("Should support L and LT formats", function()
                {
                    expect(TP.utils.datetime.format("2013-04-01T19:13:00", "ddd, L LT")).to.equal("Mon, 1/4/2013 7:13 pm");
                });

                it("Should work via conversion.formatUnitsValue", function()
                {
                    expect(TP.utils.conversion.formatUnitsValue("date", "2013-04-01T19:13:00", { dateFormat: "ddd, L LT" })).to.equal("Mon, 1/4/2013 7:13 pm");
                });
            });

            describe("Parse", function()
            {

                it("Should return a moment", function()
                {
                    var d = TP.utils.datetime.parse("1/4/2013");
                    expect(moment.isMoment(d)).to.be.ok;
                });

                it("Should parse dates as D/M/Y by default", function()
                {
                    var d = TP.utils.datetime.parse("1/4/2013");
                    expect(d.format("YYYY-MM-DD")).to.equal("2013-04-01");
                });

                it("Should parse formatted dates", function()
                {
                    var d = TP.utils.datetime.parse("1 Apr, 2013", "MMM D, YYYY");
                    expect(d.format("YYYY-MM-DD")).to.equal("2013-04-01");
                });

                it("Should work via conversion.parseUnitsValue", function()
                {
                    var d = TP.utils.conversion.parseUnitsValue("date", "1 Apr, 2013", { dateFormat: "MMM D, YYYY"} );
                    expect(d.format("YYYY-MM-DD")).to.equal("2013-04-01");
                });
            });

        });
    });
});
