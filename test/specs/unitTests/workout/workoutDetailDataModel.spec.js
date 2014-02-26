define(
[
    "models/workoutDetailData"
],
function(WorkoutDetailDataModel)
{
        describe("Workout Detail Data Model", function()
        {

                describe("Channel Management", function()
                {

                        it("Should begin with zero available channels", function()
                        {
                                var model = new WorkoutDetailDataModel();
                                expect(model.has("availableDataChannels")).to.be.ok;
                                expect(model.get("availableDataChannels").length).to.equal(0);
                        });

                        it("Should begin with zero disabled channels", function()
                        {
                                var model = new WorkoutDetailDataModel();
                                expect(model.has("disabledDataChannels")).to.be.ok;
                                expect(model.get("disabledDataChannels").length).to.equal(0);
                        });

                        it("Should begin with null channel cuts", function()
                        {
                                var model = new WorkoutDetailDataModel();
                                expect(model.has("channelCuts")).to.not.be.ok;
                        });

                        it("Should read available channels from flatSamples.channelMask", function()
                        {
                                var model = new WorkoutDetailDataModel({flatSamples: {
                                    channels: [
                                        { name: "Elevation", samples: []},
                                        { name: "Temperature", samples: []},
                                        { name: "HeartRate", samples: []}
                                    ]
                                }});

                                expect(model.has("availableDataChannels")).to.be.ok;
                                expect(model.get("availableDataChannels").length).to.equal(3);
                        });

                        describe("Disable Channel", function()
                        {
                                var model;

                                beforeEach(function()
                                {
                                    model = new WorkoutDetailDataModel();
                                    model.set("availableDataChannels", ["Cadence", "Speed", "Power"]);
                                    model.set("disabledDataChannels", ["Cadence", "Speed"]);
                                    model.disableChannel("Speed");
                                });

                                it("Should add the channel to the disabledDataChannels list", function()
                                {
                                        expect(_.contains(model.get("disabledDataChannels"), "Speed")).to.be.ok;
                                });

                                it("Should not remove the channel from the availableDataChannels list", function()
                                {
                                        expect(_.contains(model.get("availableDataChannels"), "Speed")).to.be.ok;
                                });

                        });

                        describe("Enable Channel", function()
                        {
                                var model;

                                beforeEach(function()
                                {
                                    model = new WorkoutDetailDataModel();
                                    model.set("availableDataChannels", ["Cadence", "Speed", "Power"]);
                                    model.set("disabledDataChannels", ["Cadence", "Speed"]);
                                    model.enableChannel("Speed");
                                });

                                it("Should remove the channel from the disabledDataChannels list", function()
                                {
                                        expect(_.contains(model.get("disabledDataChannels"), "Speed")).to.not.be.ok;
                                });

                                it("Should not remove the channel from the availableDataChannels list", function()
                                {
                                        expect(_.contains(model.get("availableDataChannels"), "Speed")).to.be.ok;
                                });
                        });

                        describe("Cut Channel", function()
                        {
                                var model;

                                beforeEach(function()
                                {
                                    model = new WorkoutDetailDataModel({
                                        flatSamples: {
                                            channels: [
                                                { name: "Speed", samples: [0] },
                                                { name: "Cadence", samples: [1] },
                                                { name: "Power", samples: [3] },
                                                { name: "MillisecondOffset", samples: [0] }
                                            ]
                                        }
                                    });
                                    model.cutChannel("Speed");
                                });

                                it("Should remove the channel from the availableDataChannels list", function()
                                {
                                        expect(_.contains(model.get("availableDataChannels"), "Speed")).to.not.be.ok;
                                });

                                it("Should have channelCuts", function()
                                {
                                        expect(model.has("channelCuts")).to.be.ok;
                                        expect(model.get("channelCuts").length).to.equal(1);
                                });

                        });

                });

        });
});
