// requirejs(
// [
//     "moment",
//     "underscore",
//     "app",
//     "TP",
//     "models/workoutModel",
//     "views/expando/lapSplitView",
//     "utilities/lapsstats",
//     "testUtils/AppTestData/detailDataLapsStats"
// ],
// function(moment, _, theMarsApp, TP, LapSplitView, LapsStats, detailDataLapsStats)
// {
//   describe("Lap Split View", function()
//   {
//     var buildWorkoutModel = function()
//     {
//       var detailData = new TP.Model({lapsStats: detailDataLapsStats});
//       detailData.rangeCollections = {laps: new TP.Collection(detailDataLapsStats)};
//       return new TP.Model({
//         id: 1234,
//         details: new TP.Model(),
//         workoutTypeValueId: 3,
//         detailData: detailData
//       });
//     },

//     buildLapModel = function()
//     {
//       return new TP.Model(_.extend({}, detailDataLapsStats[0], {id: 1235}));
//     },
//     setTSSsource = function(model, tssSource)
//     {
//       model.trainingStressScoreActualSource = tssSource;
//     };

//     it("Should be defined as a module", function()
//     {
//       expect(LapSplitView).toBeDefined();
//     });

//     describe("serializing data", function()
//     {
//       var model = buildLapModel(),
//           view = new LapSplitView({model: model});

//       var workoutModel = buildWorkoutModel();
//       var headerNames = workoutModel.serializeData().headerNames;
//       view.workoutDefaults = { sportTypeID: 3 };
//       view.keyNames = headerNames;
//       var serializedData = view.serializeData();

//       it("Should format time appropriately", function()
//       {
//         expect(serializedData.lapData[1].value).toBe("00:00");
//       });
//       it("Should include NGP for run or walk workouts", function()
//       {
//         view.workoutDefaults = { sportTypeID: 3 };
//         expect(_.contains(serializedData.lapData, "ngp")).toBeTruthy();
//       });
//       it("Should exclude NGP for other workout types", function()
//       {
//         view.workoutDefaults = { sportTypeID: 1 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "ngp")).toBeFalsy();
//       });
//       it("Should exclude Normalized Power for run and walk workouts", function()
//       {
//         view.workoutDefaults = { sportTypeID: 3 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "np")).toBeFalsy();
//       });
//       it("Should format TSS label correctly", function()
//       {
//         setTSSsource(model, "RunningTss");
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "rtss")).toBeTruthy();
//         expect(_.contains(serializedData.lapData, "tss")).toBeFalsy();
//       });
//       it("Should show Average Speed for rides (as opposed to Average Pace)", function()
//       {
//         view.workoutDefaults = { sportTypeID: 2 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "avgPace")).toBeFalsy();
//         expect(_.contains(serializedData.lapData, "avgSpeed")).toBeTruthy();
//       });
//       it("Should show Average Pace for runs, walks, and swims (as opposed to Average Speed)", function()
//       {
//         view.workoutDefaults = { sportTypeID: 3 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "avgPace")).toBeTruthy();

//         view.workoutDefaults = { sportTypeID: 13 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "avgPace")).toBeTruthy();

//         view.workoutDefaults = { sportTypeID: 1 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "avgPace")).toBeTruthy();
//       });
//       it("Should not show maximum cadence for swim workouts", function()
//       {
//         view.workoutDefaults = { sportTypeID: 1 };
//         serializedData = view.serializeData();
//         expect(_.contains(serializedData.lapData, "maxCadence")).toBeFalsy();
//       });
//     });

//     describe("ordering data", function()
//     {
//       var model = buildLapModel(),
//         view = new LapSplitView({model: model}),
//         checkOrder = function(attr, i, tssType, serializedData) {
//           it("Should include the " + attr + " field in location " + i + " for " + tssType + " layout", function()
//           {
//             expect(serializedData.lapData[i].key).toBe(attr);
//           });
//         };

//       var workoutModel = buildWorkoutModel();
//       var headerNames = workoutModel.serializeData().headerNames;
//       view.workoutDefaults = { sportTypeID: 3 };
//       view.keyNames = headerNames;
//       var serializedData = view.serializeData();

//       checkOrder("lap", 0, "any tss", serializedData);
//       checkOrder("start", 1, "any tss", serializedData);
//       checkOrder("end", 2, "any tss", serializedData);
//       checkOrder("duration", 3, "any tss", serializedData);
//       checkOrder("movingDuration", 4, "any tss", serializedData);
//       checkOrder("kilometers", 5, "any tss", serializedData);

//       setTSSsource(model, "PowerTss");
//       view.workoutDefaults = { sportTypeID: 1 };
//       serializedData = view.serializeData();
//       checkOrder("if", 7, "PowerTss", serializedData);
//       checkOrder("np", 8, "PowerTss", serializedData);
//       checkOrder("avgPower", 9, "PowerTss", serializedData);
//       checkOrder("maxPower", 10, "PowerTss", serializedData);

//       setTSSsource(model, "RunningTss");
//       view.workoutDefaults = { sportTypeID: 3 };
//       serializedData = view.serializeData();
//       checkOrder("rtss", 6, "RunningTss", serializedData);
//       checkOrder("if", 7, "RunningTss", serializedData);
//       checkOrder("ngp", 8, "RunningTss", serializedData);
//       checkOrder("avgPace", 9, "RunningTss", serializedData);
//       checkOrder("maxPace", 10, "RunningTss", serializedData);
//       checkOrder("avgHeartRate", 11, "RunningTss", serializedData);
//       checkOrder("maxHeartRate", 12, "RunningTss", serializedData);
//       checkOrder("cad", 13, "RunningTss", serializedData);
//       checkOrder("avgPower", 14, "RunningTss", serializedData);
//       checkOrder("maxPower", 15, "RunningTss", serializedData);

//       checkOrder("elevGain", 16, "RunningTss", serializedData);
//       checkOrder("elevLoss", 17, "RunningTss", serializedData);
//       checkOrder("work", 18, "RunningTss", serializedData);
//       // min/avg/max torque would go here, but it's (intentionally) not present
//       // in the data set so it won't be rendered
//       checkOrder("calories", 19, "RunningTss", serializedData);

//       setTSSsource(model, "HeartRateTss");
//       serializedData = view.serializeData();
//       checkOrder("if", 7, "HeartRateTss", serializedData);
//       checkOrder("avgHeartRate", 8, "HeartRateTss", serializedData);
//       checkOrder("maxHeartRate", 9, "HeartRateTss", serializedData);
//     });

//     describe("Rendering", function()
//     {
//       var model, view;
//       var workoutModel = buildWorkoutModel();
//       var headerNames = workoutModel.serializeData().headerNames;

//       beforeEach(function()
//       {
//         model = buildLapModel();
//         view = new LapSplitView({model: model});
//         view.workoutDefaults = { sportTypeID: 3 };
//         view.keyNames = headerNames;
//         view.render();
//       });
//       it("Should have a table row with table data items", function()
//       {
//         expect(view.$el.find('td').length).toBeGreaterThan(10); // every workout has at least 10 fields
//         expect(view.$el.find('tr').length).toBe(1); // A single lap split item
//       });
//     });
//   });
// });