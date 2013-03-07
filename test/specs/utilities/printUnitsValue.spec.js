requirejs(
[
    "utilities/printUnitsValue"
],
function (printUnitsValue)
{
    describe("printUnitsValue", function ()
    {
        it("Should print the appropriate unit type based upon inputed value", function ()
        {
            expect(printUnitsValue(0)).toBe("English");
            expect(printUnitsValue(1)).toBe("Metric");
        });
    });
});