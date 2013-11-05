requirejs(
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
				var model = new WorkoutDetailDataModel({"flatSamples": {
					channelMask: ["Elevation", "Temperature", "HeartRate"],
					samples: []
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
					model.set("availableDataChannels", ["Speed", "Cadence"]);
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
					model.set("availableDataChannels", ["Speed", "Cadence", "Power"]);
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
					model = new WorkoutDetailDataModel();
					//model.set("availableDataChannels", ["Speed", "Cadence", "Power"]);
					model.set("flatSamples", {
						samples: [],
						msOffsetsOfSamples: [0],
						channelMask: ["Speed", "Cadence", "Power"]
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
