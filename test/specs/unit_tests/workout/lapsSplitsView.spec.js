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

		describe("serializing data", function()
		{
			var requiredAttrs = 
				[
					"Lap", "Start", "End", "Duration", "Moving Duration", "Kilometers", "Average Heart Rate",
					"Maximum Heart Rate", "Average Pace", "Average Cadence", "Calories"
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
			it("Should include Normalized Graded Pace for run or walk workouts", function()
			{
				model.set({workoutTypeValueId: 3});
				expect(_.contains(serializedData.headerNames, "Normalized Graded Pace")).toBeTruthy();
			});
			it("Should exclude Normalized Graded Pace for other workout types", function()
			{
				model.set({workoutTypeValueId: 1});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Normalized Graded Pace")).toBeFalsy();
			});
			it("Should exclude Normalized Power for run and walk workouts", function()
			{
				model.set({workoutTypeValueId: 3});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Normalized Power")).toBeFalsy();
			});
			it("Should format TSS label correctly", function()
			{
				setTSSsource(model, "RunningTss");
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "rTSS")).toBeTruthy();
				expect(_.contains(serializedData.headerNames, "TSS")).toBeFalsy();
			});
			it("Should show Average Speed for rides (as opposed to Average Pace)", function()
			{
				model.set({workoutTypeValueId: 2});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Average Pace")).toBeFalsy();
				expect(_.contains(serializedData.headerNames, "Average Speed")).toBeTruthy();
			});
			it("Should show Average Pace for runs, walks, and swims (as opposed to Average Speed)", function()
			{
				model.set({workoutTypeValueId: 3});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Average Pace")).toBeTruthy();

				model.set({workoutTypeValueId: 13});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Average Pace")).toBeTruthy();

				model.set({workoutTypeValueId: 1});
				serializedData = view.serializeData();
				expect(_.contains(serializedData.headerNames, "Average Pace")).toBeTruthy();
			});
		});

		describe("ordering data", function()
		{
			var model = buildWorkoutModel(),
				view = new LapsSplitsView({model: model}),
				serializedData = view.serializeData(),
				checkOrder = function(attr, i, tssType, serializedData) {
					it("Should include the " + attr + " field in location " + i + " for " + tssType + " layout", function()
					{
						expect(serializedData.headerNames[i]).toBe(attr);
					});
				};

			checkOrder("Lap", 0, "any tss", serializedData);
			checkOrder("Start", 1, "any tss", serializedData);
			checkOrder("End", 2, "any tss", serializedData);
			checkOrder("Duration", 3, "any tss", serializedData);
			checkOrder("Moving Duration", 4, "any tss", serializedData);
			checkOrder("Kilometers", 5, "any tss", serializedData);

			setTSSsource(model, "PowerTss");
			model.set({workoutTypeValueId: 1});
			serializedData = view.serializeData();
			checkOrder("Intensity Factor", 7, "PowerTss", serializedData);
			checkOrder("Normalized Power", 8, "PowerTss", serializedData);
			checkOrder("Average Power", 9, "PowerTss", serializedData);
			checkOrder("Maximum Power", 10, "PowerTss", serializedData);

			setTSSsource(model, "RunningTss");
			model.set({workoutTypeValueId: 3});
			serializedData = view.serializeData();
			checkOrder("rTSS", 6, "RunningTss", serializedData);
			checkOrder("Intensity Factor", 7, "RunningTss", serializedData);
			checkOrder("Normalized Graded Pace", 8, "RunningTss", serializedData);	
			checkOrder("Average Pace", 9, "RunningTss", serializedData);
			checkOrder("Maximum Pace", 10, "RunningTss", serializedData);
			checkOrder("Average Heart Rate", 11, "RunningTss", serializedData);
			checkOrder("Maximum Heart Rate", 12, "RunningTss", serializedData);
			checkOrder("Calories", 13, "RunningTss", serializedData);
			checkOrder("Average Power", 14, "RunningTss", serializedData);
			checkOrder("Maximum Power", 15, "RunningTss", serializedData);

			checkOrder("Elevation Gain", 16, "RunningTss", serializedData);
			checkOrder("Elevation Loss", 17, "RunningTss", serializedData);
			checkOrder("Energy", 18, "RunningTss", serializedData);
			// min/avg/max torque would go here, but it's (intentionally) not present 
			// in the data set so it won't be rendered
			checkOrder("Minimum Elevation", 19, "RunningTss", serializedData);
			checkOrder("Average Elevation", 20, "RunningTss", serializedData);
			checkOrder("Maximum Elevation", 21, "RunningTss", serializedData);
			checkOrder("Average Cadence", 22, "RunningTss", serializedData);
			checkOrder("Maximum Cadence", 23, "RunningTss", serializedData);
			checkOrder("Minimum Temp", 24, "RunningTss", serializedData);
			checkOrder("Average Temp", 25, "RunningTss", serializedData);
			checkOrder("Maximum Temp", 26, "RunningTss", serializedData);

			setTSSsource(model, "HeartRateTss");
			serializedData = view.serializeData();
			checkOrder("Intensity Factor", 7, "HeartRateTss", serializedData);
			checkOrder("Average Heart Rate", 8, "HeartRateTss", serializedData);
			checkOrder("Maximum Heart Rate", 9, "HeartRateTss", serializedData);

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
				expect(view.$el.find('th').length).toBeGreaterThan(10); // every workout has at least 10 fields
				expect(view.$el.find('tr').length).toBe(7); // rows including header row
			});
		});
	});
});