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
				expect(model.has("availableDataChannels")).toBeTruthy();
				expect(model.get("availableDataChannels").length).toBe(0);
			});

			it("Should begin with zero disabled channels", function()
			{
				var model = new WorkoutDetailDataModel();
				expect(model.has("disabledDataChannels")).toBeTruthy();
				expect(model.get("disabledDataChannels").length).toBe(0);
			});

			it("Should begin with null channel cuts", function()
			{
				var model = new WorkoutDetailDataModel();
				expect(model.has("channelCuts")).toBeFalsy();
			});

			it("Should read available channels from flatSamples.channelMask", function()
			{
				var model = new WorkoutDetailDataModel();
				model.set("flatSamples", {
					channelMask: ["Elevation", "Temperature", "HeartRate"],
					samples: []
				});

				expect(model.has("availableDataChannels")).toBeTruthy();
				expect(model.get("availableDataChannels").length).toBe(3);
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
					expect(_.contains(model.get("disabledDataChannels"), "Speed")).toBeTruthy();
				});

				it("Should not remove the channel from the availableDataChannels list", function()
				{
					expect(_.contains(model.get("availableDataChannels"), "Speed")).toBeTruthy();
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
					expect(_.contains(model.get("disabledDataChannels"), "Speed")).toBeFalsy();
				});

				it("Should not remove the channel from the availableDataChannels list", function()
				{
					expect(_.contains(model.get("availableDataChannels"), "Speed")).toBeTruthy();
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
					})
					model.cutChannel("Speed");
				});

				it("Should remove the channel from the availableDataChannels list", function()
				{
					expect(_.contains(model.get("availableDataChannels"), "Speed")).toBeFalsy();
				});

				it("Should have channelCuts", function()
				{
					expect(model.has("channelCuts")).toBeTruthy();
					expect(model.get("channelCuts").length).toBe(1);
				});

			});

		});

	});
});