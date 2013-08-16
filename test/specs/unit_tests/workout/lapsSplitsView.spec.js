requirejs(
[
    "moment",
    "underscore",
    "app",
    "TP",
    "views/workout/lapsSplitsView",
    "models/workoutModel",
    "testUtils/AppTestData/detailDataLapsStats"
],
function(moment, _, theMarsApp, TP, LapsSplitsView, WorkoutModel, detailDataLapsStats)
{
	describe("Laps Splits View", function()
	{
		var buildWorkoutModel = function()
		{
			return new TP.Model({
				id: 1234,
				details: new TP.Model(),
				workoutTypeValueId: 3,
				detailData: new TP.Model({lapsStats: detailDataLapsStats})
			});
		};

		it("Should be defined as a module", function()
		{
			expect(LapsSplitsView).toBeDefined();
		});

		it("Should require an attached model", function()
		{
			expect(function() { new LapsSplitsView({}); }).toThrow();
		});

		describe("serializing data", function()
		{
			var requiredAttrs = 
				[
					"begin", "end", "elapsedTime", "movingTime", "distance", "averagePower",
					"maximumPower", "averagePace", "maximumPace", "averageSpeed", "maximumSpeed",
					"calories", "maximumCadence", "averageCadence"
				],
				model = buildWorkoutModel(),
				view = new LapsSplitsView({model: model}),
				serializedData = view.serializeData(),
				checkAttr = function(attr) {
					it("Should include " + attr + " in the serialized data", function()
					{
						expect(serializedData.laps[0].hasOwnProperty(attr)).toBeTruthy();
					});
				};

			_.each(requiredAttrs, function(attr)
			{
				checkAttr(attr);
			});

			it("Should serialize data correctly", function()
			{
				expect(serializedData.laps.length).toBe(6);
			});
		});
		describe("Rendering", function()
		{
			var model, view;
			beforeEach(function()
			{
				model = buildWorkoutModel();
				view = new LapsSplitsView({model: model});
				view.render();
			});
			it("Should be a table with table rows", function()
			{
				expect(view.$el.is('table')).toBeTruthy();
				expect(view.$el.find('th').length).toBe(14); // header cells
				expect(view.$el.find('tr').length).toBe(7); // rows including header row
			});
		});
	});
});