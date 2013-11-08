define(
    [
    "shared/models/activityModel",
    "models/workoutModel"
    ],
function(
    ActivityModel,
    WorkoutModel
    )
{
    describe("ActivityModel", function()
    {
        describe(".getActivityId", function()
        {
            it("Should return null if data is insufficient to calculate id", function()
            {
                expect(ActivityModel.getActivityId(WorkoutModel, { something: "something" })).to.eql(null);
            });

            it("Should calculate correct id from class name and attributes", function()
            {
                var modelData = { workoutId: 12345 };
                expect(ActivityModel.getActivityId(WorkoutModel, modelData)).to.eql("Workout:12345");
            });

            it("Should calculate correct id from api model instance", function()
            {
                var workoutModel = new WorkoutModel({ workoutId: 67890 });
                expect(ActivityModel.getActivityId(WorkoutModel, workoutModel)).to.eql("Workout:67890");
            });

            it("Should calculate correct id from activity model instance", function()
            {
                var activityModel = ActivityModel.wrap(new WorkoutModel({ workoutId: 1234 }));
                expect(ActivityModel.getActivityId(WorkoutModel, activityModel)).to.eql("Workout:1234");
            });

        });
    });

});
