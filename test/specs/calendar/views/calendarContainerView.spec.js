// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "document",
    "jquery",
    "TP",
    "moment",
    "app",
    "views/calendarContainerView",
    "hbs!templates/views/calendarWeek"
],
function(document, $, TP, moment, theMarsApp, CalendarView, CalendarWeekTemplate)
{

    describe("CalendarView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarView).toBeDefined();
        });


        describe("scrolling", function()
        {

            it("Should trigger no events on scroll between threshholds", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var prependSpy = jasmine.createSpy("onPrepend");
                calendarView.on("prepend", prependSpy);
                var appendSpy = jasmine.createSpy("onAppend");
                calendarView.on("append", appendSpy);
                calendarView.render();
                calendarView.ui.weeksContainer.height(1000);
                calendarView.ui.weeksContainer[0].scrollHeight = 4000;
                calendarView.ui.weeksContainer.scrollTop(2000);
                calendarView.onScroll();
                expect(prependSpy).not.toHaveBeenCalled();
                expect(appendSpy).not.toHaveBeenCalled();
            });

            it("Should trigger append event on scroll down past threshhold", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var prependSpy = jasmine.createSpy("onPrepend");
                calendarView.on("prepend", prependSpy);
                var appendSpy = jasmine.createSpy("onAppend");
                calendarView.on("append", appendSpy);
                calendarView.render();
                calendarView.ui.weeksContainer.height(1000);
                calendarView.ui.weeksContainer[0].scrollHeight = 4000;
                calendarView.ui.weeksContainer.scrollTop(3000);
                calendarView.onScroll();
                expect(prependSpy).not.toHaveBeenCalled();
                expect(appendSpy).toHaveBeenCalled();
            });

            it("Should trigger prepend event on scroll up past threshhold", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var prependSpy = jasmine.createSpy("onPrepend");
                calendarView.on("prepend", prependSpy);
                var appendSpy = jasmine.createSpy("onAppend");
                calendarView.on("append", appendSpy);
                calendarView.render();
                calendarView.ui.weeksContainer.height(1000);
                calendarView.ui.weeksContainer[0].scrollHeight = 4000;
                calendarView.onScroll();
                expect(prependSpy).toHaveBeenCalled();
                expect(appendSpy).not.toHaveBeenCalled();
            });

            // not actually checking the calculations inside scrollToToday,
            // as I was having a hard time getting the fake dom to give proper offset/position calculations
            it("Should scroll to today on show", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                spyOn(calendarView, "scrollToSelector");
                calendarView.render();
                calendarView.onShow();
                expect(calendarView.scrollToSelector).toHaveBeenCalledWith(".today");
            });

            it("Should scroll to a given selector", function ()
            {
                expect(CalendarView.prototype.scrollToSelector).toBeDefined();
                expect(typeof CalendarView.prototype.scrollToSelector).toBe("function");
                
                //TODO: More testing here
            });

            it("Should scroll to a given date", function ()
            {
                expect(CalendarView.prototype.scrollToDate).toBeDefined();
                expect(typeof CalendarView.prototype.scrollToDate).toBe("function");
                
                var calendarContainerView = new CalendarView({calendarHeaderModel: new TP.Model()});

                spyOn(calendarContainerView, "scrollToSelector");

                calendarContainerView.scrollToDate(moment("2013-01-01"));
            });

        });

        describe("Calendar Week Template", function()
        {

            it("Should have a .week class", function () {
                var weekHtml = CalendarWeekTemplate({});
                expect($(weekHtml).hasClass("week")).toBeTruthy();
            });
        });

        describe("Workout drag and drop", function()
        {

            it("Should trigger itemDropped event", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var itemView = {};
                var options = {};
                spyOn(calendarView, "trigger");
                calendarView.onItemDropped(itemView, options);
                expect(calendarView.trigger).toHaveBeenCalledWith("itemDropped", options);
            });
        });

        //it("Should be able to check current scroll position", function()
        //{
        //    var calendarView = new CalendarView({ collection: new TP.Collection() });
        //    document.elementFromPoint = function()
        //    {
        //        return $("<div data-date='2013-02-04' class='day ui-droppable'><div><div class='dayHeader'><p id='calendarDate'> <span class='show-for-small'>Mon</span>04</p></div></div></div>");
        //    };
            
        //    spyOn(calendarView, "checkCurrentScrollPosition").andCallThrough();
        //    spyOn(calendarView.ui.weeksContainer, "offset").andReturn({ left: 50, top: 50 });

        //    calendarView.checkCurrentScrollPosition();
        //});

    });

});