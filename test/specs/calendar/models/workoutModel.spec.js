// use requirejs() here, not define(), for jasmine compatibility
requirejs(
    ["moment",
    "models/workoutModel"],
function(moment, WorkoutModel)
{
    describe("Workout Model", function()
    {

        it("Should load as a module", function()
        {
            expect(WorkoutModel).toBeDefined();
        });

        it("Should use WorkoutId as model id", function()
        {
            var today = moment().format("YYYY-MM-DDThh:mm:ss");
            var workoutId = "098765";
            var workout = new WorkoutModel({ WorkoutDay: today, WorkoutId: workoutId });
            expect(workout.id).toEqual(workoutId);
        });

        it("Should return correct calendar date", function()
        {
            var today = moment().format(WorkoutModel.prototype.dateFormat);
            var workoutId = "098765";
            var workout = new WorkoutModel({ WorkoutDay: today, WorkoutId: workoutId });
            expect(workout.getCalendarDate()).toEqual(moment().format(WorkoutModel.prototype.shortDateFormat));

            workout = new WorkoutModel({ WorkoutDay: moment(), WorkoutId: workoutId });
            expect(workout.getCalendarDate()).toEqual(moment().format("YYYY-MM-DD"));
        });

        describe("moveToDay", function()
        {
            var workout;
            var originalDate = moment().format(WorkoutModel.prototype.dateFormat);

            beforeEach(function()
            {
                workout = new WorkoutModel({ WorkoutId: "12345", WorkoutDay: originalDate });
            });

            it("Should update WorkoutDay and call save", function()
            {
                spyOn(workout, "save");
                var newDate = moment().add("days", 4);
                workout.moveToDay(newDate);
                expect(workout.getCalendarDate()).toEqual(newDate.format(WorkoutModel.prototype.shortDateFormat));
                expect(workout.save).toHaveBeenCalled();
            });
        });

    });

});