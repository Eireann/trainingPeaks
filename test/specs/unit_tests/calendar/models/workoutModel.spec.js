// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "app",
    "moment",
    "jquery",
    "models/workoutModel"],
function(
    app,
    moment,
    $,
    WorkoutModel)
{
    describe("Workout Model", function()
    {
        // user needs an athlete id for some of these tests to run
        beforeEach(function()
        {
            app.user.setCurrentAthleteId(1234, true);
        });

        afterEach(function()
        {
            app.user.setCurrentAthleteId(null, true);
        });

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
            var today = moment().format("YYYY-MM-DD");
            var workoutId = "098765";
            var workout = new WorkoutModel({ workoutDay: today, workoutId: workoutId });
            expect(workout.getCalendarDay()).toEqual(moment().format("YYYY-MM-DD"));
        });

        describe("moveToDay", function()
        {
            var workout;
            var originalDate = moment().format("YYYY-MM-DDThh:mm:ss");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");
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
                expect(workout.getCalendarDay()).toEqual(newDate.format("YYYY-MM-DD"));
            });

            it("Should call save", function()
            {
                var newDate = moment("2019-03-21");
                workout.moveToDay(newDate);
                expect(workout.save).toHaveBeenCalled();
            });

            it("Should remove from original collection", function()
            {
                workout.moveToDay(tomorrow);
                expect(originalCollection.remove).toHaveBeenCalledWith(workout);
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
                expect(originalCollection.add).toHaveBeenCalledWith(workout);
                expect(workout.set).toHaveBeenCalledWith("workoutDay", originalDate);
            });
        });

        describe("Cut, Copy, Paste", function()
        {
            var workout;
            var workoutAttributes = {
                "workoutId": 12345,
                "athleteId": 67890,
                "title": "My Copied Workout",
                "workoutTypeValueId": 1,
                "workoutDay": "2013-01-01T07:00:00",
                "description": "Beach Volleyball",
                "coachComments": "you are a horrible volleyball player",
                "workoutComments": "beach volleyball is fun",
                "distance": 10,
                "distancePlanned": 20,
                "totalTime": 22,
                "totalTimePlanned": 11,
                "heartRateMinimum": 100,
                "heartRateMaximum": 190,
                "heartRateAverage": 145,
                "calories": 6500,
                "caloriesPlanned": 9000,
                "tssActual": 50,
                "tssPlanned": 600,
                "velocityAverage": 10,
                "velocityPlanned": 20,
                "energy": 250,
                "energyPlanned": 100,
                "elevationGain": 5,
                "elevationGainPlanned": 1000
            };
            var attributesToCopy = [
                "athleteId",
                "title",
                "workoutTypeValueId",
                "workoutDay",
                "isItAnOr",
                "description",
                "distancePlanned",
                "totalTimePlanned",
                "caloriesPlanned",
                "tssPlanned",
                "ifPlanned",
                "velocityPlanned",
                "energyPlanned",
                "elevationGainPlanned"
            ];

            beforeEach(function()
            {
                workout = new WorkoutModel(workoutAttributes);
            });

            describe("copyToClipboard", function()
            {
                it("Should implement a copyToClipboard method", function()
                {
                    expect(WorkoutModel.prototype.copyToClipboard).toBeDefined();
                    expect(typeof WorkoutModel.prototype.copyToClipboard).toBe("function");

                });

                it("Should return a WorkoutModel", function()
                {
                    var result = workout.copyToClipboard();
                    expect(workout instanceof WorkoutModel).toBe(true);
                });

                it("Should have all of the required 'planned' attributes", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    _.each(attributesToCopy, function(attributeName)
                    {
                        expect(copiedWorkout.get(attributeName)).toBe(workout.get(attributeName));
                    });
                });

                it("Shouldn't have any 'completed' attributes", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    _.each(_.keys(workoutAttributes), function(attributeName)
                    {
                        if (!_.contains(attributesToCopy, attributeName))
                        {
                            expect(copiedWorkout.get(attributeName)).toBe(WorkoutModel.prototype.defaults[attributeName]);
                            expect(copiedWorkout.get(attributeName)).not.toBe(workout.get(attributeName));
                        }
                    });
                });
            });

            describe("cutToClipboard", function()
            {
                it("Should implement a cutToClipboard method", function()
                {
                    expect(WorkoutModel.prototype.cutToClipboard).toBeDefined();
                    expect(typeof WorkoutModel.prototype.cutToClipboard).toBe("function");
                });

                it("Should return a reference to itself", function()
                {
                    expect(workout.cutToClipboard()).toBe(workout);
                });
            });

            describe("onPaste", function()
            {
                it("Should implement an onPaste method", function()
                {
                    expect(WorkoutModel.prototype.onPaste).toBeDefined();
                    expect(typeof WorkoutModel.prototype.onPaste).toBe("function");
                });

                it("Should call moveToDay when pasting an existing workout from cut", function()
                {
                    var cutWorkout = workout.cutToClipboard();
                    spyOn(cutWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutWorkout.onPaste(dateToPasteTo);
                    expect(cutWorkout.moveToDay).toHaveBeenCalledWith(dateToPasteTo);
                });

                it("Should not call moveToDay when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    spyOn(copiedWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.onPaste(dateToPasteTo);
                    expect(copiedWorkout.moveToDay).not.toHaveBeenCalled();
                });

                it("Should return a new workout when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = copiedWorkout.onPaste(dateToPasteTo);
                    expect(pastedWorkout instanceof WorkoutModel).toBe(true);
                    expect(pastedWorkout).not.toBe(copiedWorkout);
                });

                it("Should set the correct date on pasted workout", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = copiedWorkout.onPaste(dateToPasteTo);
                    expect(pastedWorkout.getCalendarDay()).toBe(dateToPasteTo);
                });

                it("Should not change the date of the copied workout", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = copiedWorkout.onPaste(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).not.toBe(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).toBe(moment(workoutAttributes.workoutDay).format("YYYY-MM-DD"));
                });

                it("Should return a workout with all of the copied attributes", function()
                {
                    var copiedWorkout = workout.copyToClipboard();
                    var dateToPasteTo = "2012-10-10";
                    var pastedWorkout = copiedWorkout.onPaste(dateToPasteTo);

                    var attributesToCopy = [
                        "athleteId",
                        "title",
                        "workoutTypeValueId",
                        "workoutDay",
                        "isItAnOr",
                        "description",
                        "distancePlanned",
                        "totalTimePlanned",
                        "caloriesPlanned",
                        "tssPlanned",
                        "ifPlanned",
                        "velocityPlanned",
                        "energyPlanned",
                        "elevationGainPlanned"
                    ];

                    _.each(attributesToCopy, function(attributeName)
                    {
                        if (attributeName !== "workoutDay")
                        {
                            expect(pastedWorkout.get(attributeName)).toBe(copiedWorkout.get(attributeName));
                        }
                    });

                });

            });

        });
    });

});