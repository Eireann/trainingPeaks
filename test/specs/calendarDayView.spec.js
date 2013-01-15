/*
// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "views/calendarDayView"
],
function (CalendarDayView) {
    return describe("Calendar Day View", function () {

        it("should be loaded as a module", function () {
            expect(CalendarDayView).toBeDefined();
        });

        it("should not die silently due to requirejs errors ...", function () {
            expect(false).toBe(true);
        });
    });
});
*/