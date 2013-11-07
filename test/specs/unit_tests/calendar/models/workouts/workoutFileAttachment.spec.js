define(
[
    "TP",
    "models/workoutFileAttachment"
],
function (TP, WorkoutFileAttachment)
{
    describe("Workout File Attachment ", function ()
    {
        it("should throw exception if there is no workout ID", function ()
        {
            var workoutFileAttachment = new WorkoutFileAttachment();
            workoutFileAttachment.set("workoutId", null);

            var getUrl = function ()
            {
                workoutFileAttachment.url();
            };

            expect(getUrl).to.throw();

        });
    });
});
