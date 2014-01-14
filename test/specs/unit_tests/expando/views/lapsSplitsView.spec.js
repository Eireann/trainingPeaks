define(
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
			expect(LapsSplitsView).to.not.be.undefined;
		});

		it("Should require an attached model", function()
		{
			expect(function() { new LapsSplitsView({}); }).to.throw();
		});

		describe("Rendering", function()
		{
			it("Should have a table with table rows", function()
			{
				var model = buildWorkoutModel(allDataChannels);
				var view = new LapsSplitsView({model: model});
				view.render();
				expect(view.$el.find('table').length).to.be.ok;
				expect(view.$el.find('th').length).to.be.gt(10); // every workout has at least 10 fields
				expect(view.$el.find('tr').length).to.equal(7); // rows including header row
			});
		});
	});

});