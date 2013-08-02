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

        describe("Workout drag and drop", function()
        {

            it("Should trigger itemDropped event", function()
            {
                var calendarView = new CalendarView({ collection: new TP.Collection() });
                var weekView, dayView = {};
                var options = {};
                spyOn(calendarView, "trigger");
                calendarView.onItemDropped(weekView, dayView, options);
                expect(calendarView.trigger).toHaveBeenCalledWith("itemDropped", options);
            });
        });
    });
});