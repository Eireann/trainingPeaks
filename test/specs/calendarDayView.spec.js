describe("Calendar Day View", function () {

    it("Calling via requirejs", function (done) {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "document",
            "views/calendarDayView"
        ],
        function (document, CalendarDayView) {

            describe("CalendarDayView", function () {
                it("should be loaded as a module", function () {
                    expect(CalendarDayView).toBeDefined();
                });
                it("should have a render method", function () {
                    var c = new CalendarDayView();
                    expect(c.render).toBeDefined();
                    expect(typeof c.render).toEqual("function");
                });
                it("should fail", function () {
                    expect(false).toBe(true);
                });
            });

            done();
        });

    });
});