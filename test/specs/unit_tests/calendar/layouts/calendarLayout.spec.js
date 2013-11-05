define(
[
"layouts/calendarLayout"],
function(CalendarLayout)
{
    describe("Calendar Layout", function()
    {
        it("Should have a footer region", function()
        {
            expect(CalendarLayout.prototype.regions.footerRegion).to.not.be.undefined;
        });

        it("Should have a header region", function()
        {
            expect(CalendarLayout.prototype.regions.headerRegion).to.not.be.undefined;
        });

        it("Should have a calendar region", function()
        {
            expect(CalendarLayout.prototype.regions.calendarRegion).to.not.be.undefined;
        });

        it("Should have a library region", function()
        {
            expect(CalendarLayout.prototype.regions.libraryRegion).to.not.be.undefined;
        });
    });

});
