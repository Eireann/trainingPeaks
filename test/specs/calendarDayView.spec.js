describe("Calendar Day View", function () {

    it("Calling via requirejs", function (done) {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "views/calendarDayView"
        ],
        function (CalendarDayView) {

            describe("CalendarDayView", function () {
                it("should be loaded as a module", function () {
                    expect(CalendarDayView).toBeDefined();
                });
                console.log(new CalendarDayView());
            });

            done();
        });

    });
});