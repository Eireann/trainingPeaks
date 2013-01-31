// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "views/calendarView",
    "hbs!templates/views/calendarWeek"
],
function($, CalendarView, CalendarWeekTemplate)
{

    describe("CalendarView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarView).toBeDefined();
        });

        xdescribe("initialize", function ()
        {
            it("Should set numWeeks and daysLeftForWeek to 0", function()
            {
                var calendarView = new CalendarView();
                expect(calendarView.numWeeks).toEqual(0);
                expect(calendarView.numDaysLeftForWeek).toEqual(0);
            });
        });

        xdescribe("scrolling", function()
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
                calendarView.ui.weeksContainer.height(1000);
                calendarView.$weeksContainer[0].scrollHeight = 4000;
                calendarView.ui.weeksContainer.scrollTop(2000);
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
                calendarView.ui.weeksContainer.height(1000);
                calendarView.$weeksContainer[0].scrollHeight = 4000;
                calendarView.ui.weeksContainer.scrollTop(3000);
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
                calendarView.ui.weeksContainer.height(1000);
                calendarView.$weeksContainer[0].scrollHeight = 4000;
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

        describe("Calendar Week Template", function()
        {

            it("Should have a .week class", function () {
                var weekHtml = CalendarWeekTemplate({});
                expect($(weekHtml).hasClass("week")).toBeTruthy();
            });
        });

        xdescribe("Workout drag and drop", function()
        {

            it("Should bind to itemView workoutMoved event", function()
            {
                var calendarView = new CalendarView();
                var itemView = jasmine.createSpyObj('itemView spy', ['bind']);
                calendarView.appendHtml({}, itemView, 0);
                expect(itemView.bind).toHaveBeenCalledWith("workoutMoved", calendarView.onWorkoutMoved);
            });

            it("Should trigger workoutMoved event", function()
            {
                var calendarView = new CalendarView();
                var itemView = {};
                var options = {};
                spyOn(calendarView, "trigger");
                calendarView.onWorkoutMoved(itemView, options);
                expect(calendarView.trigger).toHaveBeenCalledWith("workoutMoved", options);
            });
        });

    });

});