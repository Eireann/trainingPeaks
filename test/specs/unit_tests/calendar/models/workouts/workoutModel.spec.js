define(
[
    "moment",
    "jquery",
    "TP",
    "models/workoutModel",
    "testUtils/testHelpers"
],
function(
    moment,
    $,
    TP,
    WorkoutModel,
    testHelpers
)
{
    describe("Workout Model", function()
    {

        beforeEach(function()
        {
            testHelpers.stubCurrentAthleteId();
        });

        it("Should load as a module", function()
        {
            expect(WorkoutModel).to.not.be.undefined;
        });

        it("Should use workoutId as model id", function()
        {
            var today = moment().format("YYYY-MM-DDTHH:mm:ss");
            var workoutId = "098765";
            var workout = new WorkoutModel({ workoutDay: today, workoutId: workoutId });
            expect(workout.id).to.eql(workoutId);
        });

        it("Should return correct calendar date", function()
        {
            var today = moment().format("YYYY-MM-DD");
            var workoutId = "098765";
            var workout = new WorkoutModel({ workoutDay: today, workoutId: workoutId });
            expect(workout.getCalendarDay()).to.eql(moment().format("YYYY-MM-DD"));
        });

        describe("moveToDay", function()
        {
            var workout;
            var originalDate = moment().format("YYYY-MM-DD");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");

            beforeEach(function()
            {
                testHelpers.setupFakeAjax();
                workout = new WorkoutModel({ workoutId: "12345", workoutDay: originalDate });
            });

            afterEach(function()
            {
                testHelpers.removeFakeAjax();
            });

            it("Should update workoutDay on success", function()
            {
                workout.moveToDay(tomorrow);
                testHelpers.resolveRequest("PUT", "", {});
                expect(workout.getCalendarDay()).to.eql(tomorrow);
            });

            it("Should not update workoutDay on failure", function()
            {
                workout.moveToDay(tomorrow);
                testHelpers.rejectRequest("PUT", "");
                expect(workout.getCalendarDay()).to.eql(originalDate);
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
                sinon.spy(testHelpers.theApp.calendarManager, "addItem");
                testHelpers.theApp.user.setCurrentAthleteId(67890);
                workout = new WorkoutModel(workoutAttributes);
            });

            describe("cloneForCopy", function()
            {
                it("Should implement a cloneForCopy method", function()
                {
                    expect(WorkoutModel.prototype.cloneForCopy).to.not.be.undefined;
                    expect(typeof WorkoutModel.prototype.cloneForCopy).to.equal("function");

                });

                it("Should return a WorkoutModel", function()
                {
                    var result = workout.cloneForCopy();
                    expect(workout instanceof WorkoutModel).to.equal(true);
                });

                it("Should have all of the required 'planned' attributes", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    _.each(attributesToCopy, function(attributeName)
                    {
                        expect(copiedWorkout.get(attributeName)).to.equal(workout.get(attributeName));
                    });
                });

                it("Shouldn't have any 'completed' attributes", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    _.each(_.keys(workoutAttributes), function(attributeName)
                    {
                        if (!_.contains(attributesToCopy, attributeName))
                        {
                            expect(copiedWorkout.get(attributeName)).to.equal(WorkoutModel.prototype.defaults[attributeName]);
                            expect(copiedWorkout.get(attributeName)).to.not.equal(workout.get(attributeName));
                        }
                    });
                });
            });

            describe("pasted", function()
            {
                it("Should implement an pasted method", function()
                {
                    expect(WorkoutModel.prototype.pasted).to.not.be.undefined;
                    expect(typeof WorkoutModel.prototype.pasted).to.equal("function");
                });

                it("Should call moveToDay when pasting an existing workout from cut", function()
                {
                    var cutWorkout = workout;
                    sinon.stub(cutWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutWorkout.pasted({ date: dateToPasteTo });
                    expect(cutWorkout.moveToDay).to.have.been.calledWith(dateToPasteTo);
                });

                it("Should not call moveToDay when pasting a workout from cut on different athlete", function()
                {
                    testHelpers.theApp.user.setCurrentAthleteId(42);
                    var cutWorkout = workout;
                    sinon.stub(cutWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutWorkout.pasted({ date: dateToPasteTo });
                    expect(cutWorkout.moveToDay).to.not.have.been.called;
                });

                it("Should not call moveToDay when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    sinon.stub(copiedWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    expect(copiedWorkout.moveToDay).to.not.have.been.called;
                });

                it("Should return a new workout when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedWorkout).to.be.an.instanceof(WorkoutModel);
                    expect(pastedWorkout).to.not.equal(copiedWorkout);
                });

                it("Should set the correct date on pasted workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedWorkout.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the copied workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedWorkout.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).to.equal(moment(workoutAttributes.workoutDay).format("YYYY-MM-DD"));
                });

                
                it("Should set the correct athleteId on pasted workout", function()
                {
                    testHelpers.theApp.user.setCurrentAthleteId(42);
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedWorkout.get("athleteId")).to.equal(42);
                });

                it("Should not change the athleteId of the copied workout", function()
                {
                    testHelpers.theApp.user.setCurrentAthleteId(42);
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedWorkout.get("athleteId")).to.not.equal(42);
                });

                it("Should return a workout with all of the copied attributes", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];

                    var attributesToCopy = [
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
                            expect(pastedWorkout.get(attributeName)).to.equal(copiedWorkout.get(attributeName));
                        }
                    });

                });

            });

        });
    });

});
