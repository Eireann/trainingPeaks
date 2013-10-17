requirejs(
[
    "models/commands/saveWorkoutDetailData"
],
function(SaveWorkoutDetailDataCommand)
{
    describe("Save Workout Detail Data Command", function()
    {
        it("Should start with default values", function()
        {
            var command = new SaveWorkoutDetailDataCommand();
            expect(command.get("lapsStats")).toBe(null);
            expect(command.get("channelCuts")).toBe(null);
            expect(command.get("sampleEdits")).toBe(null);
            expect(command.get("applyElevationCorrection")).toBe(false);
        });

        describe("Channel edit ids", function()
        {

            var command;

            beforeEach(function()
            {
                command = new SaveWorkoutDetailDataCommand();
                spyOn(command, "save");
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
                expect(execCommand).toThrow();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: null
                    }
                ]);
                expect(execCommand).toThrow();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: "WrongChannelName"
                    }
                ]);
                expect(execCommand).toThrow();

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: "Power"
                    }
                ]);
                expect(execCommand).not.toThrow();
            });

            it("Should set channel ids for valid channel names", function()
            {

                command.set("channelCuts", [
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: "Power"
                    },
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: "Cadence"
                    },
                    {
                        startTimeInMilliseconds: 0,
                        endTimeInMilliseconds: 1000,
                        channelEdit: "Torque"
                    }
                ]);

                command.execute();

                expect(command.get("channelCuts")[0].channelEdit).toBe(128);
                expect(command.get("channelCuts")[1].channelEdit).toBe(2);
                expect(command.get("channelCuts")[2].channelEdit).toBe(1024);

            });
        });
    });
});