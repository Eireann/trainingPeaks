// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "controllers/calendarController"
],
function (CalendarController) {
    return describe("View Test", function () {
        it("should be a tautology", function () {
            expect(true).toBe(false);
            var controller = new CalendarController();
            expect(typeof controller.initialize).toBe("function");
        });
    });
});