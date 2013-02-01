// use requirejs() instead of define() here, to keep jasmine test runner happy
requirejs(
[
    "moment",
    "models/workoutModel",
    "views/calendarWorkoutView"
],
function(moment, WorkoutModel, CalendarWorkoutView)
{

    describe("CalendarWorkoutView ", function()
    {

        it("should be loaded as a module", function()
        {
            expect(CalendarWorkoutView).toBeDefined();
        });

        it("should watch for model change events", function()
        {
            var workoutModel = new WorkoutModel({ WorkoutDay: "2012-01-01", WorkoutId: "7373737" });
            var workoutView = new CalendarWorkoutView({ model: workoutModel });
            expect(workoutView.modelEvents.change).toBeDefined();
            expect(workoutView.modelEvents.change).toEqual("render");
        });

    });

});