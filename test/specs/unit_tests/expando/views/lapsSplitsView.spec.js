requirejs(
[
    "moment",
    "underscore",
    "TP",
    "views/expando/lapsSplitsView",
    "models/workoutModel",
    "testUtils/AppTestData/detailDataLapsStats"
],
function(moment, _, TP, LapsSplitsView, WorkoutModel, detailDataLapsStats)
{
	describe("Laps Splits View", function()
	{
		var allDataChannels = ["Power", "Elevation", "Speed", "HeartRate", "Torque", "Cadence"];

		var buildWorkoutModel = function(availableDataChannels)
		{
			var detailData = new TP.Model({lapsStats: detailDataLapsStats });
			detailData.set("availableDataChannels", availableDataChannels);
			detailData.rangeCollections = {laps: new TP.Collection(detailDataLapsStats)};
			detailData.getRangeCollectionFor = function(key)
			{
				return this.rangeCollections[key];
			};
			
			return new TP.Model({
				id: 1234,
				details: new TP.Model(),
				workoutTypeValueId: 3,
				detailData: detailData
			});
		},
		setTSSsource = function(model, tssSource)
		{
			_.each(model.get('detailData').get('lapsStats'), function(lapStat, i)
			{
				lapStat.trainingStressScoreActualSource = tssSource;
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

		describe("Rendering", function()
		{
			var model, view;
			beforeEach(function()
			{
				model = buildWorkoutModel(allDataChannels);
				view = new LapsSplitsView({model: model});
				view.render();
			});
			it("Should have a table with table rows", function()
			{
				expect(view.$el.find('table').length).toBeTruthy();
				expect(view.$el.find('th').length).toBeGreaterThan(10); // every workout has at least 10 fields
				expect(view.$el.find('tr').length).toBe(7); // rows including header row
			});
		});
	});

});
