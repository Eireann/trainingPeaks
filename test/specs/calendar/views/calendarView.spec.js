describe("Calendar View", function()
{

    it("Using requirejs to load tests ...", function(done)
    {

        // use requirejs() instead of define() here, to keep jasmine test runner happy
        requirejs(
        [
            "jquery",
            "views/calendarView"
        ],
        function($, CalendarView)
        {

            describe("CalendarView ", function()
            {

                it("Should be loaded as a module", function ()
                {
                    expect(CalendarView).toBeDefined();
                });

                describe("initialize", function ()
                {
                    it("Should set numWeeks and daysLeftForWeek to 0", function()
                    {
                        var calendarView = new CalendarView();
                        expect(calendarView.numWeeks).toEqual(0);
                        expect(calendarView.numDaysLeftForWeek).toEqual(0);
                    });
                });

                describe("scrolling", function()
                {
                    it("Should watch for scroll events", function()
                    {
                        expect(CalendarView.prototype.events.scroll).toBeDefined();
                        expect(CalendarView.prototype.events.scroll).toEqual("onscroll");
                    });

                    it("Should trigger no events on scroll between threshholds", function()
                    {
                        var calendarView = new CalendarView();
                        var prependSpy = jasmine.createSpy("onPrepend");
                        calendarView.on("prepend", prependSpy);
                        var appendSpy = jasmine.createSpy("onAppend");
                        calendarView.on("append", appendSpy);
                        calendarView.render();
                        calendarView.$el.height(1000);
                        calendarView.el.scrollHeight = 4000;
                        calendarView.$el.scrollTop(2000);
                        calendarView.onscroll();
                        expect(prependSpy).not.toHaveBeenCalled();
                        expect(appendSpy).not.toHaveBeenCalled();
                    });

                    it("Should trigger append event on scroll down past threshhold", function()
                    {
                        var calendarView = new CalendarView();
                        var prependSpy = jasmine.createSpy("onPrepend");
                        calendarView.on("prepend", prependSpy);
                        var appendSpy = jasmine.createSpy("onAppend");
                        calendarView.on("append", appendSpy);
                        calendarView.render();
                        calendarView.$el.height(1000);
                        calendarView.el.scrollHeight = 4000;
                        calendarView.$el.scrollTop(3000);
                        calendarView.onscroll();
                        expect(prependSpy).not.toHaveBeenCalled();
                        expect(appendSpy).toHaveBeenCalled();
                    });

                    it("Should trigger prepend event on scroll up past threshhold", function()
                    {
                        var calendarView = new CalendarView();
                        var prependSpy = jasmine.createSpy("onPrepend");
                        calendarView.on("prepend", prependSpy);
                        var appendSpy = jasmine.createSpy("onAppend");
                        calendarView.on("append", appendSpy);
                        calendarView.render();
                        calendarView.$el.height(1000);
                        calendarView.el.scrollHeight = 4000;
                        calendarView.onscroll();
                        expect(prependSpy).toHaveBeenCalled();
                        expect(appendSpy).not.toHaveBeenCalled();
                    });

                    // not actually checking the calculations inside scrollToToday,
                    // as I was having a hard time getting the fake dom to give proper offset/position calculations
                    it("Should scroll to today on show", function()
                    {
                        var calendarView = new CalendarView();
                        spyOn(calendarView, "scrollToToday").andCallThrough();
                        calendarView.render();
                        calendarView.onShow();
                        expect(calendarView.scrollToToday).toHaveBeenCalled();
                    });

                });

            });

            done();
        });

    });
});