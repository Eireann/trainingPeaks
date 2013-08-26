requirejs(
    [
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "TP",
    "app",
    "jquery",
    "models/workoutModel",
    "views/calendar/library/exerciseLibraryView"],
function(
    testHelpers,
    xhrData,
    moment,
    TP,
    theMarsApp,
    $,
    WorkoutModel,
    ExerciseLibraryView)
{
    describe("save dragged workout to library", function()
    {
        var today = moment().format("YYYY-MM-DDThh:mm:ss");
        var workout = new WorkoutModel({ workoutDay: today});

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            theMarsApp.router.navigate("calendar", true);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should have created a droppable section in the workout library", function()
        {
            var libraryView = theMarsApp.currentController.views.library;

            theMarsApp.currentController.libraryCollections.exerciseLibraries.add(new TP.Model({libraryName: "My Library"}));
            spyOn(ExerciseLibraryView.prototype, "listenTo").andReturn("");
            spyOn(libraryView.$el, "droppable");
            libraryView.$el.find("#exerciseLibrary").click();
            expect(libraryView.$el.droppable).toHaveBeenCalled();

        });
        it("Should create a workout library template from a dropped workout", function()
        {

        });
    });
});