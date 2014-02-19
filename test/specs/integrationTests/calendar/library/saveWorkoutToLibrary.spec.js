define(
    [
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "TP",
    "jquery",
    "models/workoutModel",
    "shared/models/activityModel",
    "views/calendar/library/exerciseLibraryView"],
function(
    testHelpers,
    xhrData,
    moment,
    TP,
    $,
    WorkoutModel,
    ActivityModel,
    ExerciseLibraryView)
{
    describe("save dragged workout to library", function()
    {

        var today = moment().format("YYYY-MM-DDTHH:mm:ss");
        var workout = new WorkoutModel({ workoutDay: today, workoutId: '123' });
        
        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
            testHelpers.theApp.router.navigate("calendar", true);
            testHelpers.theApp.calendarManager.activities.add(ActivityModel.wrap(workout));
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
        });

        it("Should accept draggables in the workout library", function()
        {
            expect(ExerciseLibraryView.prototype.onWorkoutDropped).to.not.be.undefined;
        });

        describe("Should open and populate the save-workout-to-library confirmation view from a dropped workout", function()
        {   
            var exerciseLibraryView;
            beforeEach(function()
            {
                sinon.stub(ExerciseLibraryView.prototype, "initialize").returns(null);
                exerciseLibraryView = new ExerciseLibraryView({model: new TP.Model({selected: '321'})});
                
                exerciseLibraryView.onWorkoutDropped(null, {
                    draggable: {
                        data: function()
                        {
                            return workout;
                        }
                    }
                });

            });
            
            it("Should attach a valid confirmation view", function()
            {
                expect(exerciseLibraryView.saveToLibraryConfirmationView).to.not.be.undefined;
            });

            it("Should send the correct model", function()
            {
                expect(exerciseLibraryView.saveToLibraryConfirmationView.model).to.equal(workout);
            });

        });
    });
});
