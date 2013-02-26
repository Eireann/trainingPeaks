requirejs(
["utilities/dayName"],
function(dayName)
{
    describe("dayName template helper", function()
    {

        it("Should say Monday", function()
        {
            expect(dayName(1, 'dddd')).toEqual("Monday");
        });

        it("Should say Thursday", function()
        {
            expect(dayName(4, 'dddd')).toEqual("Thursday");
        });

        it("Should say Tue", function()
        {
            expect(dayName(2)).toEqual('Tue');
        });

        it("Should say Friday", function()
        {
            expect(dayName('2013-01-25', 'dddd')).toEqual('Friday');
        });
    });
});