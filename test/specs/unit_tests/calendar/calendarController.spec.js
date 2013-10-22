// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "TP",
    "app",
    "moment",
    "jquery",
    "underscore",
    "backbone",
    "framework/dataManager",
    "shared/models/calendarManager",
    "controllers/calendar/calendarController",
    "models/workoutModel",
    "models/workoutsCollection",
    "models/library/trainingPlan",
    "views/calendar/container/calendarContainerView",
    "views/calendar/library/libraryView"
],
function(
    TP,
    theMarsApp,
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
            theMarsApp.user.setCurrentAthleteId(1234, true);
        });

        afterEach(function()
        {
            theMarsApp.user.setCurrentAthleteId(null, true);
        });

        it("Should load successfully as a module", function()
        {
            expect(CalendarController).toBeDefined();
        });

        describe("Initialize controller", function()
        {
            it("Should have a getLayout method", function()
            {
                expect(typeof CalendarController.prototype.getLayout).toBe("function");
            });
            
            it("Should have a layout", function()
            {
                var controller = buildController();
                expect(controller.getLayout()).toBeDefined();
            });

        });

        describe("Show calendar", function()
        {
            var controller;

            beforeEach(function()
            {
                controller = buildController();
                spyOn(controller, "showViewsInRegions");
                spyOn(controller, "showDate");
            });

            it("Should initialize the header", function()
            {
                spyOn(controller, "initializeHeader").andCallThrough();
                controller.show();
                expect(controller.initializeHeader).toHaveBeenCalled();
            });

            it("Should initialize the calendar", function()
            {
                spyOn(controller, "initializeCalendar");
                controller.show();
                expect(controller.initializeCalendar).toHaveBeenCalled();
            });

            it("Should initialize the library", function()
            {
                spyOn(controller, "initializeLibrary");
                controller.show();
                expect(controller.initializeLibrary).toHaveBeenCalled();
            });

            it("Should display the views in their regions", function()
            {
                controller.show();
                expect(controller.showViewsInRegions).toHaveBeenCalled();
            });

            it("Should load the library data after user loads", function()
            {
                spyOn(controller, "loadLibraryData").andReturn([]);
                controller.show();
                expect(controller.loadLibraryData).toHaveBeenCalled();
            });

            it("Should load the calendar data after user loads", function()
            {
                spyOn(controller, "loadCalendarData").andReturn([]);
                controller.show();
                expect(controller.loadCalendarData).toHaveBeenCalled();
            });
        });

        describe("initializeCalendar", function()
        {
            it("Should create a CalendarView", function()
            {
                var controller = buildController();
                spyOn(CalendarView.prototype, "initialize").andCallThrough();
                controller.initializeHeader();
                controller.initializeCalendar();
                expect(CalendarView.prototype.initialize).toHaveBeenCalled();
            });

        });

        describe("Load calendar data", function()
        {

            it("Should call requestWorkouts once for each week", function()
            {
                var controller = buildController();
                spyOn(controller.calendarManager, "loadActivities");
                controller.loadCalendarData();
                expect(controller.calendarManager.loadActivities).toHaveBeenCalled();
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
                    expect(controller.libraryCollections.exerciseLibraries).toBeDefined();
                });
                
            });

            it("Should fetch the exercise library", function()
            {
                var controller = buildController();
                controller.initializeLibrary();
                spyOn(controller.libraryCollections.exerciseLibraries, "fetch");
                controller.loadLibraryData();
                expect(controller.libraryCollections.exerciseLibraries.fetch).toHaveBeenCalled();
            });
        });

        describe("initializeLibrary", function()
        {
            it("Should create a LibraryView", function()
            {
                var controller = buildController();
                spyOn(LibraryView.prototype, "initialize").andCallThrough();
                controller.initializeLibrary();
                expect(LibraryView.prototype.initialize).toHaveBeenCalled();
            });

        });

        describe("showDate", function()
        {

            var controller;
            
            beforeEach(function()
            {
                controller = buildController();
                spyOn(controller.calendarManager, "reset");
                controller.initializeHeader();
                controller.initializeCalendar();
                spyOn(controller.views.calendar, "scrollToDate");
                controller.views.calendar = jasmine.createSpyObj("calendar view spy", ["scrollToDate"]);
            });

            it("Should scroll to date, but not reset, if within current date range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 1);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();

            });

            it("Should reset if requested date is more than 8 weeks outside current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 16);
                controller.showDate(showDate);
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();
            });

            it("Should prepend week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).subtract("weeks", 5);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();

            });

            it("Should append week if date is before current range", function()
            {
                controller.startDate = moment().day(0);
                controller.endDate = moment().day(0).add("weeks", 3);
                var showDate = moment().day(3).add("weeks", 6);
                controller.showDate(showDate);
                expect(controller.calendarManager.reset).not.toHaveBeenCalled();
                expect(controller.views.calendar.scrollToDate).toHaveBeenCalled();
            });
        });

    });

});
