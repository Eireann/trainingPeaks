requirejs(
[
    "utilities/defaultValue"
],
function (getDefaultValue)
{
    describe("defaultValue utility", function ()
    {
        it("Should return a default value for undefined or null", function ()
        {
            var undef;
            var n = null;
            expect(getDefaultValue(undef, 0)).toBe(0);
            expect(getDefaultValue(n, 0)).toBe(0);
        });

        it("Should return the original value if it isn't undefined or null", function ()
        {
            var i = 42;
            expect(getDefaultValue(i, 0)).toBe(42);
        });
    });
});