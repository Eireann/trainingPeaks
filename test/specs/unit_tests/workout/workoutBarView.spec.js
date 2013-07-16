requirejs(
[
    "moment",
    "views/workout/workoutBarView",
    "models/workoutModel"
],
function(moment, WorkoutBarView, WorkoutModel)
{
    describe("WorkoutBarView", function()
    {
        var workoutModel;
        
        beforeEach(function()
        {
            workoutModel = new WorkoutModel({
                workoutValueTypeId: 1
                , totalTime: 1.25
                , totalTimePlanned: 1.5
                , distance: 1000
                , distancePlanned: 1200
                , tssActual: 100
                , tssPlanned: 110
            });
        });
        
        it("should go get me a pizza", function()
        {

        });
    });
});