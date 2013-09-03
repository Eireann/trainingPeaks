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
        var workout = new WorkoutModel({ workoutDay: today, workoutId: '123'});
        
        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            theMarsApp.router.navigate("calendar", true);
            theMarsApp.controllers.calendarController.weeksCollection.workoutsCollection.add(workout);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should accept draggables in the workout library", function()
        {
            expect(ExerciseLibraryView.prototype.onWorkoutDropped).toBeDefined();
        });
        describe("Should open and populate the save-workout-to-library confirmation view from a dropped workout", function()
        {   
            var exerciseLibraryView;
            beforeEach(function()
            {
                spyOn(ExerciseLibraryView.prototype, "initialize").andReturn(null);
                exerciseLibraryView = new ExerciseLibraryView({model: new TP.Model({selected: '321'})});
                
                exerciseLibraryView.onWorkoutDropped(null, {
                    draggable: {
                        data: function()
                        {
                            return workout.get('workoutId');
                        }
                    }
                });

            });
            
            it("Should attach a valid confirmation view", function()
            {
                expect(exerciseLibraryView.saveToLibraryConfirmationView).toBeDefined();
            });
            it("Should send the correct model", function()
            {
                expect(exerciseLibraryView.saveToLibraryConfirmationView.model).toBe(workout);
            });
        });
    });
});