define(
[
    "TP",
    "testUtils/testHelpers",
    "moment",
    "jquery",
    "underscore",
    "backbone",
    "framework/dataManager",
    "shared/managers/calendarManager",
    "controllers/calendar/calendarController",
    "models/workoutModel",
    "models/workoutsCollection",
    "models/library/trainingPlan",
    "views/calendar/container/calendarContainerView",
    "views/calendar/library/libraryView"
],
function(
    TP,
    testHelpers,
    moment,
    $,
    _,
    Backbone,
    DataManager,
    CalendarManager,
    CalendarController,
    WorkoutModel,
    WorkoutsCollection,
    TrainingPlan,
    CalendarView,
    LibraryView
    )
{

    function buildController()
    {
        var dataManager = new DataManager();
        var calendarManager = new CalendarManager({ dataManager: dataManager });
        var controller = new CalendarController({
            dataManager: dataManager,
            calendarManager: calendarManager
        });

        return controller;
    }

    describe("Calendar Controller", function()
    {

        beforeEach(function()
        {
            theMarsApp.user.setCurrentAthlete(new TP.Model({ athleteId: 1234 }));
        });

        it("Should load successfully as a module", function()
        {
            expect(CalendarController).to.not.be.undefined;
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof CalendarController.prototype.getLayout).to.equal("function");
            });
            
            it("Should have a layout", function()
            {
                var controller = buildController();
                expect(controller.getLayout()).to.not.be.undefined;
            });

        });

        describe("Show calendar", function()
        {
            var controller;

            beforeEach(function()
            {
                theMarsApp.user.setCurrentAthlete(new TP.Model({ athleteId: 1234 }));
                controller = buildController();
                sinon.stub(controller, "showViewsInRegions");
                sinon.stub(controller, "showDate");
            });

            it("Should initialize the header", function()
            {
                sinon.spy(controller, "initializeHeader");
                controller.show();
                expect(controller.initializeHeader).to.have.been.called;
            });

            it("Should initialize the calendar", function()
            {
                sinon.stub(controller, "initializeCalendar");
                controller.show();
                expect(controller.initializeCalendar).to.have.been.called;
            });

            it("Should initialize the library", function()
            {
                sinon.stub(controller, "initializeLibrary");
                controller.show();
                expect(controller.initializeLibrary).to.have.been.called;
            });

            it("Should display the views in their regions", function()
            {
                controller.show();
                expect(controller.showViewsInRegions).to.have.been.called;
            });

            it("Should load the library data after user loads", function()
            {
                sinon.stub(controller, "loadLibraryData").returns([]);
                controller.show();
                expect(controller.loadLibraryData).to.have.been.called;
            });

            it("Should load the calendar data after user loads", function()
            {
                sinon.stub(controller, "loadCalendarData").returns([]);
                controller.show();
                expect(controller.loadCalendarData).to.have.been.called;
            });
        });

        describe("initializeCalendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = buildController();
                sinon.spy(CalendarView.prototype, "initialize");
                controller.initializeHeader();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).to.have.been.called;
            });

        });

        describe("Load calendar data", function()
        {

            it("Should call requestWorkouts once for each week", function()
            {
                var controller = buildController();
                sinon.stub(controller.calendarManager, "loadActivities");
                controller.loadCalendarData();
                expect(controller.calendarManager.loadActivities).to.have.been.called;
            });

        });

        describe("Load library data", function()
        {

            describe("Initialize library", function()
            {
                it("Should create an exerciseLibraries", function()
                {
                    var controller = buildController();
                    controller.initializeLibrary();
                    expect(controller.libraryCollections.exerciseLibraries).to.not.be.undefined;
                });
                
            });

            it("Should fetch the exercise library", function()
            {
                var controller = buildController();
                controller.initializeLibrary();
                sinon.stub(controller.libraryCollections.exerciseLibraries, "fetch");
                controller.loadLibraryData();
                expect(controller.libraryCollections.exerciseLibraries.fetch).to.have.been.called;
            });
        });

        describe("initializeLibrary", function()
        {
            it("Should create a LibraryView", function()
            {
                var controller = buildController();
                sinon.spy(LibraryView.prototype, "initialize");
                controller.initializeLibrary();
                expect(LibraryView.prototype.initialize).to.have.been.called;
            });

        });

        describe("showDate", function()
        {

            var controller;
            
            beforeEach(function()
            {
                controller = buildController();
                sinon.stub(controller.calendarManager, "reset");
                controller.initializeHeader();
                controller.initializeCalendar();
                sinon.stub(controller.views.calendar, "scrollToDate");
                controller.views.calendar = createSpyObj("calendar view spy", ["scrollToDate"]);
            });

            it("Should scroll to date, but not reset, if within current date range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 1);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).to.not.have.been.called;
                expect(controller.views.calendar.scrollToDate).to.have.been.called;

            });

            it("Should reset if requested date is more than 8 weeks outside current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 16);
                controller.showDate(showDate);
                expect(controller.views.calendar.scrollToDate).to.have.been.called;
            });

            it("Should prepend week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).subtract("weeks", 5);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).to.not.have.been.called;
                expect(controller.views.calendar.scrollToDate).to.have.been.called;

            });

            it("Should append week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 6);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).to.not.have.been.called;
                expect(controller.views.calendar.scrollToDate).to.have.been.called;
            });
        });

    });

});
