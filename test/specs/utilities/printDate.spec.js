requirejs(
[
    "utilities/printDate"
],
function(printDate)
{
    describe("printDate template helper", function()
    {
        it("Should print a formated date from a unix epoch integer", function()
        {
            var unixEpoch = 946710000000; // 01/01/2000T00:00:00 MST

            expect(printDate(unixEpoch, "YYYY-DD-MM")).toBe("2000-01-01");
            expect(printDate(unixEpoch, "YY-DD-MM")).toBe("00-01-01");
        });
        
        it("Should print a formatted year, month, and day on the first of the year", function()
        {
            var testDate = "Jan 1, 2013";
            expect(printDate(testDate)).toBe("Jan 01 2013");
        });

        xit("Should print a formatted month and day on the first of the month", function()
        {
            var testDate = "Feb 1, 2013";
            expect(printDate(testDate)).toBe("Feb 01");
        });
    });
});