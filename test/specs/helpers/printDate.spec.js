requirejs(
["scripts/helpers/printDate"],
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
    });
});