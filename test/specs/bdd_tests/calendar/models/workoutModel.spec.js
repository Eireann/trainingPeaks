define(
    [
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "moment",
    "jquery",
    "backbone",
    "models/workoutModel"],
function(
    testHelpers,
    xhrData,
    moment,
    $,
    Backbone,
    WorkoutModel)
{
    describe("Workout Model", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
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
            var originalDate = moment().format("YYYY-MM-DDTHH:mm:ss");
            var tomorrow = moment().add("days", 1).format("YYYY-MM-DD");

            beforeEach(function()
            {
                workout = new WorkoutModel({ workoutId: "12345", workoutDay: originalDate });
                sinon.stub(workout, "save").returns($.Deferred());
            });

            it("Should call save", function()
            {
                workout.moveToDay(tomorrow);
                expect(workout.save).to.have.been.called;
            });
        });

        describe("duplicate POST protection", function()
        {
            it("Should not save multiple copies", function()
            {
                var model = new WorkoutModel();
                model.save();
                model.save();

                var requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.resolveRequest("POST", "/workouts", { workoutId: 42 });

                requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                requests = testHelpers.findAllRequests("PUT", "/workouts/42");
                expect(requests).to.have.length(1);
            });
            
            it("Should start delayed saves on failures", function()
            {
                var model = new WorkoutModel();
                model.save();
                model.save();

                var requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(1);

                testHelpers.rejectRequest("POST", "/workouts");

                requests = testHelpers.findAllRequests("POST", "/workouts");
                expect(requests).to.have.length(2);
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
                sinon.spy(theMarsApp.calendarManager, "addItem");
                theMarsApp.user.setCurrentAthlete(67890, new Backbone.Model());
                workout = new WorkoutModel(workoutAttributes);
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

                it("Should not call moveToDay when pasting a workout from copy", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    sinon.stub(copiedWorkout, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    expect(copiedWorkout.moveToDay).to.not.have.been.called;
                });

                it("Should set the correct date on pasted workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedWorkout.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the copied workout", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedWorkout.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedWorkout.getCalendarDay()).to.equal(moment(workoutAttributes.workoutDay).format("YYYY-MM-DD"));
                });

                it("Should return a workout with all of the copied attributes", function()
                {
                    var copiedWorkout = workout.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedWorkout.pasted({ date: dateToPasteTo });
                    var pastedWorkout = theMarsApp.calendarManager.addItem.firstCall.args[0];

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
