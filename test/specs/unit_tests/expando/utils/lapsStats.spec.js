define(
[
    "underscore",
    "TP",
    "utilities/LapsStats",
    "models/workoutModel",
    "testUtils/AppTestData/detailDataLapsStats",
    "testUtils/testHelpers"
],
function(_, TP, LapsStats, WorkoutModel, detailDataLapsStats, testHelpers)
{

    describe("Laps Stats Utility", function()
    {
        var allDataChannels = ["Power", "Distance", "Elevation", "Speed", "HeartRate", "Torque", "Cadence"];

        function buildWorkoutModel(availableDataChannels)
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
        }

        function setTSSsource (model, tssSource)
        {
            model.set("trainingStressScoreActualSource", tssSource);
        }

        function serializeData(model)
        {
            var lapsStats = new LapsStats({ model: model });

            return {
                headerNames: lapsStats.getHeaders(),
                rowData: lapsStats.processRows({ format: true })
            };
        }

        describe("serializing data", function()
        {
            describe("with all channels enabled", function()
            {
                var serializedData;
                var requiredAttrs = 
                    [
                        "Lap", "Start", "End", "Duration", "Moving Duration", "Kilometers", "Avg Heart Rate",
                        "Max Heart Rate", "Avg Pace", "Cad", "Calories"
                    ],
                    model = buildWorkoutModel(allDataChannels),
                    checkAttr = function(attr) {
                        it("Should include " + attr + " in the serialized data", function()
                        {
                            expect(_.contains(serializedData.headerNames, attr)).to.be.ok;
                        });
                    };

                beforeEach(function()
                {
                    serializedData = serializeData(model);
                });

                _.each(requiredAttrs, function(attr)
                {
                    checkAttr(attr);
                });

                it("Should serialize six rows of data", function()
                {
                    expect(serializedData.rowData.length).to.equal(6);
                });
                it("Should format time appropriately", function()
                {
                    expect(serializedData.rowData[0][1]).to.equal("00:00");
                });
                it("Should include NGP for run or walk workouts", function()
                {
                    model.set({workoutTypeValueId: 3});
                    expect(_.contains(serializedData.headerNames, "NGP")).to.be.ok;
                });
                it("Should exclude NGP for other workout types", function()
                {
                    model.set({workoutTypeValueId: 1});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "NGP")).to.not.be.ok;
                });
                it("Should exclude Normalized Power for run and walk workouts", function()
                {
                    model.set({workoutTypeValueId: 3});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "NP")).to.not.be.ok;
                });
                it("Should include Normalized Power for bike workouts", function()
                {
                    model.set({workoutTypeValueId: 2});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "NP")).to.be.ok;
                });
                it("Should format TSS label correctly", function()
                {
                    setTSSsource(model, "RunningTss");
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "rTSS")).to.be.ok;
                    expect(_.contains(serializedData.headerNames, "TSS")).to.not.be.ok;
                });
                it("Should show Average Speed for rides (as opposed to Average Pace)", function()
                {
                    model.set({workoutTypeValueId: 2});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Avg Pace")).to.not.be.ok;
                    expect(_.contains(serializedData.headerNames, "Avg Speed")).to.be.ok;
                });
                it("Should show Average Pace for runs, walks, and swims (as opposed to Average Speed)", function()
                {
                    model.set({workoutTypeValueId: 3});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Avg Pace")).to.be.ok;

                    model.set({workoutTypeValueId: 13});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Avg Pace")).to.be.ok;

                    model.set({workoutTypeValueId: 1});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Avg Pace")).to.be.ok;
                });
                it("Should not show maximum cadence for swim workouts", function()
                {
                    model.set({workoutTypeValueId: 1});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Max Cadence")).to.not.be.ok;
                });
                it("Should show maximum power for bike workouts", function()
                {
                    model.set({workoutTypeValueId: 2});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Max Power")).to.be.ok;
                });
            });

            describe("with heart rate channel disabled", function()
            {
                var serializedData, model;

                beforeEach(function()
                {
                    model = buildWorkoutModel(_.without(allDataChannels, "HeartRate"));
                    serializedData = serializeData(model);
                });

                it("Should serialize six rows of data", function()
                {
                    expect(serializedData.rowData.length).to.equal(6);
                });

                it("Should exclude Avg Heart Rate", function()
                {
                    expect(_.contains(serializedData.headerNames, "Avg Heart Rate")).to.not.be.ok;
                });

                it("Should exclude Max Heart Rate", function()
                {
                    expect(_.contains(serializedData.headerNames, "Max Heart Rate")).to.not.be.ok;
                });
            });

            describe("with power channel disabled", function()
            {
                var model, serializedData;

                beforeEach(function()
                {
                    model = buildWorkoutModel(_.without(allDataChannels, "Power"));
                    serializedData = serializeData(model);
                });

                it("Should serialize six rows of data", function()
                {
                    expect(serializedData.rowData.length).to.equal(6);
                });

                it("Should exclude Normalized Power", function()
                {
                    model.set({workoutTypeValueId: 2});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "NP")).to.not.be.ok;
                });

                it("Should exclude Max Power", function()
                {
                    model.set({workoutTypeValueId: 2});
                    serializedData = serializeData(model);
                    expect(_.contains(serializedData.headerNames, "Max Power")).to.not.be.ok;
                });
            });
        });

        describe("ordering data", function()
        {
            var model = buildWorkoutModel(allDataChannels);
            var serializedData = serializeData(model)
            var checkOrder = function(attr, i, tssType, serializedData) {
                    it("Should include the " + attr + " field in location " + i + " for " + tssType + " layout", function()
                    {
                        expect(serializedData.headerNames[i]).to.equal(attr);
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
            serializedData = serializeData(model);
            checkOrder("IF", 7, "PowerTss", serializedData);
            checkOrder("NP", 8, "PowerTss", serializedData);
            checkOrder("Avg Power", 9, "PowerTss", serializedData);
            checkOrder("Max Power", 10, "PowerTss", serializedData);

            setTSSsource(model, "RunningTss");
            model.set({workoutTypeValueId: 3});
            serializedData = serializeData(model);
            checkOrder("rTSS", 6, "RunningTss", serializedData);
            checkOrder("IF", 7, "RunningTss", serializedData);
            checkOrder("NGP", 8, "RunningTss", serializedData);
            checkOrder("Avg Pace", 9, "RunningTss", serializedData);
            checkOrder("Max Pace", 10, "RunningTss", serializedData);
            checkOrder("Avg Heart Rate", 11, "RunningTss", serializedData);
            checkOrder("Max Heart Rate", 12, "RunningTss", serializedData);
            checkOrder("Cad", 13, "RunningTss", serializedData);
            checkOrder("Avg Power", 14, "RunningTss", serializedData);
            checkOrder("Max Power", 15, "RunningTss", serializedData);

            checkOrder("Elev Gain", 16, "RunningTss", serializedData);
            checkOrder("Elev Loss", 17, "RunningTss", serializedData);
            checkOrder("Work", 18, "RunningTss", serializedData);
            // min/avg/max torque would go here, but it's (intentionally) not present
            // in the data set so it won't be rendered
            checkOrder("Calories", 19, "RunningTss", serializedData);

            setTSSsource(model, "HeartRateTss");
            serializedData = serializeData(model);
            checkOrder("IF", 7, "HeartRateTss", serializedData);
            checkOrder("Avg Heart Rate", 8, "HeartRateTss", serializedData);
            checkOrder("Max Heart Rate", 9, "HeartRateTss", serializedData);
        });
    });
});
