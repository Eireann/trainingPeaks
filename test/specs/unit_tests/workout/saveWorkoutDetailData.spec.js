define(
[
    "models/commands/saveWorkoutDetailData"
],
function(SaveWorkoutDetailDataCommand)
{
    describe("Save Workout Detail Data Command", function()
    {
        it("Should start with default values", function()
        {
            var command = new SaveWorkoutDetailDataCommand({},{workoutId: 1, uploadedFileId: 2});
            expect(command.get("lapsStats")).to.equal(null);
            expect(command.get("channelCuts")).to.equal(null);
            expect(command.get("sampleEdits")).to.equal(null);
            expect(command.get("applyElevationCorrection")).to.equal(false);
        });

        describe("Channel edit ids", function()
        {

            var command;

            beforeEach(function()
            {
                command = new SaveWorkoutDetailDataCommand({},{workoutId: 1, uploadedFileId: 2});
                sinon.stub(command, "save");
            });

            it("Should throw an exception for invalid channel names", function()
            {

                var execCommand = function(){
                    command.execute();
                };

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000
                    }
                ]);
                expect(execCommand).to.throw();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: null
                    }
                ]);
                expect(execCommand).to.throw();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: "WrongChannelName"
                    }
                ]);
                expect(execCommand).to.throw();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: "Power"
                    }
                ]);
                expect(execCommand).to.not.throw();
            });

            it("Should set channel ids for valid channel names", function()
            {

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: "Power"
                    },
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: "Cadence"
                    },
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channel: "Torque"
                    }
                ]);

                command.execute();

                expect(command.get("channelCuts")[0].channel).to.equal(128);
                expect(command.get("channelCuts")[1].channel).to.equal(2);
                expect(command.get("channelCuts")[2].channel).to.equal(1024);

            });
        });
    });
});
