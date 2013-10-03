// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "moment",
    "TP",
    "models/calendar/calendarDay",
    "models/workoutModel",
    "views/calendar/workout/calendarWorkoutView",
    "views/calendar/day/calendarDayView"
],
function(
    moment,
    TP,
    CalendarDayModel,
    WorkoutModel,
    CalendarWorkoutView,
    CalendarDayView)
{

    describe("CalendarDayView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarDayView).toBeDefined();
        });

        describe("render", function()
        {

            // this className won't break anything in the javascript, but the css is depending on it
            it("Should have 'day' css class", function()
            {
                var dayModel = new CalendarDayModel({ date: moment().format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('day')).toBeTruthy();
            });

            it("Should add a 'today' class if the date is today", function()
            {
                var today = moment();
                var dayModel = new CalendarDayModel({ date: today.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('today')).toBeTruthy();
            });

            it("Should not add a 'today' class if the date is not today", function()
            {
                var tomorrow = moment().add("days", 1);
                var dayModel = new CalendarDayModel({ date: tomorrow.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('today')).toBeFalsy();
            });

            it("Should render a date", function()
            {
                var today = moment();
                var dayModel = new CalendarDayModel({ date: today.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.html()).toContain(TP.utils.datetime.format(today, "calendarDay"));
            });

            describe("Drag and drop", function()
            {

                it("Should make $el a droppable target", function()
                {
                    var dayModel = new CalendarDayModel({ date: moment().format(TP.utils.datetime.shortDateFormat) });
                    var dayView = new CalendarDayView({ model: dayModel });
                    spyOn(dayView.$el, "droppable");
                    dayView.setUpDroppable();
                    expect(dayView.$el.droppable).toHaveBeenCalledWith({ drop: dayView.onDropItem, tolerance: 'pointer' });
                });

                it("Should trigger an itemDropped event", function()
                {
                    var dayModel = new CalendarDayModel({ date: moment().format(TP.utils.datetime.shortDateFormat) });
                    var dayView = new CalendarDayView({ model: dayModel });
                    var uiMock = {
                        draggable: {
                            data: function() {
                                return {
                                    ItemId: "12345",
                                    ItemType: "Workout",
                                    DropEvent: "itemMoved"
                                };
                            }
                        }
                    };
                    spyOn(dayView, "trigger");
                    dayView.onDropItem({}, uiMock);
                    eventOptions = { ItemId: "12345", DropEvent: "itemMoved", ItemType: "Workout", destinationCalendarDayModel: dayModel };
                    expect(dayView.trigger).toHaveBeenCalledWith("itemDropped", eventOptions);
                });

            });

        });
    });

});