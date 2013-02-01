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
            expect(CalendarWorkoutView.prototype.modelEvents.change).toBeDefined();
            expect(CalendarWorkoutView.prototype.modelEvents.change).toEqual("render");
        });

    });

});