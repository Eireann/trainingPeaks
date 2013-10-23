// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "testUtils/testHelpers",
    "moment",
    "shared/managers/calendarManager",
    "framework/dataManager"
],
function(
    testHelpers,
    moment,
    CalendarManager,
    DataManager
)
{
    describe("CalendarManager", function()
    {

        var calendarManager, dataManager;
        beforeEach(function()
        {
            testHelpers.setupFakeAjax();
            dataManager = new DataManager();
            calendarManager = new CalendarManager({ dataManager: dataManager });
        });
        
        afterEach(function()
        {
            testHelpers.removeFakeAjax();
        });

        it("should start with empty weeks, days, and activities collections", function()
        {
            expect(calendarManager.weeks).toBeDefined();
            expect(calendarManager.weeks.length).toEqual(0);
            expect(calendarManager.days).toBeDefined();
            expect(calendarManager.days.length).toEqual(0);
            expect(calendarManager.activities).toBeDefined();
            expect(calendarManager.activities.length).toEqual(0);
        });

        it("::ensure today should add weeks and days", function()
        {

            calendarManager.ensure(moment());

            expect(calendarManager.weeks.length).toEqual(1);
            expect(calendarManager.days.length).toEqual(7);

        });

    });

});

