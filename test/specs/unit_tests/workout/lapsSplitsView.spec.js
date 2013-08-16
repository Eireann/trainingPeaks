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
					"Lap", "Start", "Finish", "Duration", "Moving Time", "Distance", "Average Power",
					"Maximum Power", "Average Pace", "Maximum Pace", "Average Speed", "Maximum Speed",
					"Calories", "Maximum Cadence", "Average Cadence"
				],
				model = buildWorkoutModel(),
				view = new LapsSplitsView({model: model}),
				serializedData = view.serializeData(),
				checkAttr = function(attr) {
					it("Should include " + attr + " in the serialized data", function()
					{
						expect(_.contains(serializedData.headerNames, attr)).toBeTruthy();
					});
				};

			_.each(requiredAttrs, function(attr)
			{
				checkAttr(attr);
			});

			it("Should serialize six rows of data", function()
			{
				expect(serializedData.rowData.length).toBe(6);
			});
			it("Should format time appropriately", function()
			{
				expect(serializedData.rowData[0][1]).toBe("00:00");
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
				expect(view.$el.find('th').length).toBe(15); // header cells
				expect(view.$el.find('tr').length).toBe(7); // rows including header row
			});
		});
	});
});