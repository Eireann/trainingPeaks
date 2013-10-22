// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
"layouts/calendarLayout"],
function(CalendarLayout)
{
    describe("Calendar Layout", function()
    {
        it("Should have a footer region", function()
        {
            expect(CalendarLayout.prototype.regions.footerRegion).toBeDefined();
        });

        it("Should have a header region", function()
        {
            expect(CalendarLayout.prototype.regions.headerRegion).toBeDefined();
        });

        it("Should have a calendar region", function()
        {
            expect(CalendarLayout.prototype.regions.calendarRegion).toBeDefined();
        });

        it("Should have a library region", function()
        {
            expect(CalendarLayout.prototype.regions.libraryRegion).toBeDefined();
        });
    });

});
