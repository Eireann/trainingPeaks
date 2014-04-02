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
                testHelpers.theApp.user.setCurrentAthlete(new TP.Model({ athleteId: 67890 }));
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

               var activityMover, workout; 
                beforeEach(function()
                {
                    activityMover = { pasteActivityToDay: sinon.stub() };
                    workout = new WorkoutModel(workoutAttributes, { activityMover: activityMover });
                });

                it("Should implement a pasted method", function()
                {
                    expect(WorkoutModel.prototype.pasted).to.not.be.undefined;
                    expect(typeof WorkoutModel.prototype.pasted).to.equal("function");
                });

                it("Should call activityMover.pasteActivityToDay", function()
                {
                    workout.pasted({ date: "2014-01-01" });
                    expect(activityMover.pasteActivityToDay).to.have.been.calledWith(workout, "2014-01-01");
                });

            });

        });

        describe("parse", function()
        {
            it("Should update the post activity comments collection if it already exists", function()
            {
                var workout = new WorkoutModel();
                var postActivityComments = workout.getPostActivityComments();
                expect(postActivityComments.length).to.eql(0);
                workout.parse({
                    workoutComments: [
                        { firstName: "test", lastName: "user", comment: "some comment" }
                    ]                    
                });
                expect(postActivityComments.length).to.eql(1);
            });

            it("Should not create a post activity comments collection if it does not already exist", function()
            {
                var workout = new WorkoutModel();
                workout.parse({
                    workoutComments: [
                        { firstName: "test", lastName: "user", comment: "some comment" }
                    ]                    
                });
                expect(workout.postActivityComments).to.not.be.ok;
            });

            it("Should remove time zone offset string from start time", function()
            {
                var workout = new WorkoutModel();
                expect(workout.parse({ startTime: "2014-01-01T12:00:00-06:00" }).startTime).to.eql("2014-01-01T12:00");
                expect(workout.parse({ startTime: "2014-03-19T15:51:49.3923409-06:00" }).startTime).to.eql("2014-03-19T15:51");
               
            });
        });

    });

});
