define(
[
    "moment",
    "TP",
    "testUtils/testHelpers",
    "models/calendar/calendarDay",
    "models/workoutModel",
    "views/calendar/workout/calendarWorkoutView",
    "views/calendar/day/calendarDayView"
],
function(
    moment,
    TP,
    testHelpers,
    CalendarDayModel,
    WorkoutModel,
    CalendarWorkoutView,
    CalendarDayView)
{

    describe("CalendarDayView ", function()
    {

        it("Should be loaded as a module", function()
        {
            expect(CalendarDayView).to.not.be.undefined;
        });

        describe("render", function()
        {

            // this className won't break anything in the javascript, but the css is depending on it
            it("Should have 'day' css class", function()
            {
                var dayModel = new CalendarDayModel({ date: moment.local().format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('day')).to.be.ok;
            });

            it("Should add a 'today' class if the date is today", function()
            {
                var today = moment.local();
                var dayModel = new CalendarDayModel({ date: today.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('today')).to.be.ok;
            });

            it("Should not add a 'today' class if the date is to.notday", function()
            {
                var tomorrow = moment.local().add("days", 1);
                var dayModel = new CalendarDayModel({ date: tomorrow.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.hasClass('today')).to.not.be.ok;
            });

            it("Should render a date", function()
            {
                var today = moment.local();
                var dayModel = new CalendarDayModel({ date: today.format(TP.utils.datetime.shortDateFormat) });
                var dayView = new CalendarDayView({ model: dayModel });
                dayView.render();
                expect(dayView.$el.html()).to.contain(TP.utils.datetime.format(today, "calendarDay"));
            });

            describe("Drag and drop", function()
            {

                it("Should make $el a droppable target", function()
                {
                    var dayModel = new CalendarDayModel({ date: moment.local().format(TP.utils.datetime.shortDateFormat) });
                    var dayView = new CalendarDayView({ model: dayModel });
                    sinon.stub(dayView.$el, "droppable");
                    dayView.setUpDroppable();
                    expect(dayView.$el.droppable).to.have.been.called;
                });

            });

        });
    });

});
