requirejs(
[
    "utilities/charting/findOrderedArrayIndexByValue"
],
function(findOrderedArrayIndexByValue)
{
    describe("findOrderedArrayIndexByValue finds the index for a value within a given ordered list", function()
    {
        it("returns -1 when the list is empty", function()
        {
            var list = [];
            expect(findOrderedArrayIndexByValue(list, 0)).toBe(-1);
        });

        it("returns the last index if the value is not within the list", function()
        {
            var list = [1, 2, 3, 4, 5, 6, 7, 8];
            expect(findOrderedArrayIndexByValue(list, 10)).toBe(7);
        });

        it("returns the correct index if the value is within the list", function()
        {
            var list = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
            expect(findOrderedArrayIndexByValue(list, 10)).toBe(0);
            expect(findOrderedArrayIndexByValue(list, 20)).toBe(1);
            expect(findOrderedArrayIndexByValue(list, 100)).toBe(9);
        });

        it("works on a very long list", function()
        {
            var list = [];

            for (var i = 0; i < 999999; i++)
            {
                list.push(i);
            }

            expect(findOrderedArrayIndexByValue(list, 9999)).toBe(9999);
        });
    });
});