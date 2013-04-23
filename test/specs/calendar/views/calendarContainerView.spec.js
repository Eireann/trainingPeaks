// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "jquery",
    "TP",
    "moment",
    "app",
    "views/calendar/container/calendarContainerView"
],
function($, TP, moment, theMarsApp, CalendarView)
{

    describe("CalendarView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarView).toBeDefined();
        });

        it("Should be able to add a week", function()
        {
            expect(CalendarView.prototype.addWeek).toBeDefined();
            expect(typeof CalendarView.prototype.addWeek).toBe("function");

            var context =
            {
                onItemDropped: function ()
                {
                },
                ui:
                {
                    weeksContainer:
                    {
                        append: function()
                        {
                        },
                        prepend: function()
                        {
                        },
                        scrollTop: function()
                        {
                        }
                    }
                },
                children:
                {
                    push: function()
                    {
                        
                    }
                }
            };

            var options =
            {
                collection: new TP.Collection(),
                model: new TP.Model()
            };

            expect(function()
            {
                CalendarView.prototype.addWeek.call(context, options);
            }).not.toThrow();
            
            options.append = true;
            
            expect(function ()
            {
                CalendarView.prototype.addWeek.call(context, options);
            }).not.toThrow();
        });


        describe("scrolling", function()
        {

            xit("Should trigger no events on scroll between threshholds", function()
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

            xit("Should trigger append event on scroll down past threshhold", function()
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

                var calendarContainerView = new CalendarView({ calendarHeaderModel: new TP.Model(), collection: new TP.Collection() });

                spyOn(calendarContainerView, "scrollToSelector");

                calendarContainerView.scrollToDate(moment("2013-01-01"));
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
    });
});