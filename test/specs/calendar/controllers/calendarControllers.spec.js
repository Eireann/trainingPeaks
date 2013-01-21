describe("Calendar Controller spec", function()
{

    // Use 'it("",function(done) ' - this makes jasmine wait for done() to be called,
    // or else some of our tests won't run if requirejs files don't return in time
    it("Loading controller tests via requirejs", function(done)
    {

        // use requirejs() here, not define(), for jasmine compatibility
        requirejs(
        ["controllers/calendarController",
        "backbone"],
        function(CalendarController, Backbone)
        {
            describe("Calendar Controller", function()
            {

                it("should load successfully as a module", function()
                {
                    expect(CalendarController).toBeDefined();
                });

                it("should have a layout", function()
                {
                    var controller = new CalendarController();
                    expect(controller.layout).toBeDefined();
                });

                describe("Initialize controller", function()
                {

                    beforeEach(function()
                    {
                        //spyOn(Backbone, "sync");
                    });

                    it("should have a startDate", function()
                    {
                        var controller = new CalendarController();
                        expect(controller.startDate).toBeDefined();
                    });

                });
            });

            // have to call done() after our final test
            done();
        });

    });

});