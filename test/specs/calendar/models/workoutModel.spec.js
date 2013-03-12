// use requirejs() here, not define(), for jasmine compatibility
requirejs(
    ["moment",
    "jquery",
    "models/workoutModel"],
function(moment, $, WorkoutModel)
{
    describe("Workout Model", function()
    {

        it("Should load as a module", function()
        {
            expect(WorkoutModel).toBeDefined();
        });

        it("Should use workoutId as model id", function()
        {
            var today = moment().format("YYYY-MM-DDThh:mm:ss");
            var workoutId = "098765";
            var workout = new WorkoutModel({ workoutDay: today, workoutId: workoutId });
            expect(workout.id).toEqual(workoutId);
        });

        it("Should return correct calendar date", function()
        {
            var today = moment().format(WorkoutModel.prototype.shortDateFormat);
            var workoutId = "098765";
            var workout = new WorkoutModel({ workoutDay: today, workoutId: workoutId });
            expect(workout.getCalendarDay()).toEqual(moment().format(WorkoutModel.prototype.shortDateFormat));
        });

        describe("moveToDay", function()
        {
            var workout;
            var originalDate = moment().format(WorkoutModel.prototype.dateFormat);
            var tomorrow = moment().add("days", 1).format(WorkoutModel.prototype.dateFormat);
            var workout;
            var originalCollection;
            var newCollection;

            beforeEach(function()
            {
                originalCollection = jasmine.createSpyObj("Original Collection", ["add", "remove"]);
                newCollection = jasmine.createSpyObj("New Collection", ["add", "remove"]);

                workout = new WorkoutModel({ workoutId: "12345", workoutDay: originalDate });
                workout.dayCollection = originalCollection;
                spyOn(workout, "save").andReturn($.Deferred());
            });

            it("Should update workoutDay and call save", function()
            {
                var newDate = moment("2013-01-19");
                workout.moveToDay(newDate);
                expect(workout.getCalendarDay()).toEqual(newDate.format(WorkoutModel.prototype.shortDateFormat));
            });

            it("Should call save", function()
            {
                var newDate = moment("2019-03-21");
                workout.moveToDay(newDate);
                expect(workout.save).toHaveBeenCalled();
            });

            it("Should remove from original collection on success", function()
            {
                workout.moveToDay(tomorrow).resolve();
                expect(originalCollection.remove).toHaveBeenCalledWith(workout);
            });

            it("Should not remove from original collection until success", function()
            {
                workout.moveToDay(tomorrow);
                expect(originalCollection.remove).not.toHaveBeenCalledWith(workout);
            });

            it("Should add to new collection", function()
            {
                workout.moveToDay(tomorrow, newCollection);
                expect(newCollection.add).toHaveBeenCalledWith(workout);
            });

            it("Should move workout back if save fails", function()
            {
                spyOn(workout, "set").andCallThrough();
                workout.moveToDay(tomorrow, newCollection).reject();
                expect(newCollection.remove).toHaveBeenCalledWith(workout);
                expect(workout.set).toHaveBeenCalledWith("workoutDay", originalDate);
            });
        });

        it("Should implement a copyToClipboard method that copies the groomed workout to the clipboard", function()
        {
            expect(WorkoutModel.prototype.copyToClipboard).toBeDefined();
            expect(typeof WorkoutModel.prototype.copyToClipboard).toBe("function");
            
            var workout = new WorkoutModel({ workoutId: "12345", workoutDay: moment().format(WorkoutModel.prototype.dateFormat) });

            expect(workout.copyToClipboard()).toBeDefined();
        });

        it("Should implement a cutToClipboard method that puts a reference to iteself onto the clipboard", function()
        {
            expect(WorkoutModel.prototype.cutToClipboard).toBeDefined();
            expect(typeof WorkoutModel.prototype.cutToClipboard).toBe("function");

            var workout = new WorkoutModel({ workoutId: "12345", workoutDay: moment().format(WorkoutModel.prototype.dateFormat) });

            expect(workout.cutToClipboard()).toBe(workout);
        });
    });

});