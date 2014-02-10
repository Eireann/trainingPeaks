define(
[
    "underscore",
    "jquery",
    "TP",
    "views/elevationCorrection/elevationCorrectionView",
    "utilities/charting/graphData",
    "models/workoutDetailData",
    "testUtils/AppTestData/GET_DetailData_139251189"
],
    function (_, $, TP, ElevationCorrectionView, GraphData, WorkoutDetailData, DetailData)
    {
        function buildWorkoutModel()
        {
            return new TP.Model(
                {
                    details: new TP.Model(),
                    detailData: new WorkoutDetailData(DetailData)
                }
            );
        }

        describe("Elevation Correction", function ()
        {
            describe("Initialization", function()
            {
                it("Should throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function()
                {
                    var constructorWithNoOptions = function()
                    {
                        ElevationCorrectionView.prototype.validateWorkoutModel({});
                    };

                    var constructorWithNoDetailData = function()
                    {
                        ElevationCorrectionView.prototype.validateWorkoutModel({ workoutModel: new TP.Model() });
                    };

                    expect(constructorWithNoOptions).to.throw();
                    expect(constructorWithNoDetailData).to.throw();
                });

                it("Should not throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function()
                {
                    var constructorWithOptions = function()
                    {
                        ElevationCorrectionView.prototype.validateWorkoutModel({ workoutModel: buildWorkoutModel() });
                    };

                    expect(constructorWithOptions).to.not.throw();
                });
            });

            describe("Plot Rendering", function()
            {

                it("Should contain original elevation", function()
                {
                    var originalElevation = [100, 102, 110];
                    var viewContext = {
                        originalElevation: originalElevation,
                        elevationCorrectionModel: new TP.Model()
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).to.equal(1);
                    expect(series[0].data).to.equal(originalElevation);
                });

                it("Should contain corrected elevation if it is available", function()
                {
                    var originalElevation = [100, 102, 110];
                    var correctedElevation = [103, 105, 114];

                    var graphData = new GraphData({detailData: {} });
                    sinon.stub(graphData, "createCorrectedElevationChannel").returns(correctedElevation);

                    var viewContext = {
                        model: buildWorkoutModel(),
                        originalElevation: originalElevation,
                        elevationCorrectionModel: new TP.Model({elevations: correctedElevation}),
                        _getGraphData: function(){return graphData;}
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).to.equal(2);
                    expect(series[0].data).to.equal(originalElevation);
                    expect(series[1].data).to.equal(correctedElevation);
                });
            });

            describe("Show corrected elevation", function()
            {

                var workoutModel, elevationCorrectionModel, viewContext;

                beforeEach(function()
                {
                    var workoutModel = new TP.Model({
                        distance: 1000,
                        detailData: new TP.Model({
                            totalStats: {
                                minimumElevation: 1,
                                averageElevation: 2,
                                maximumElevation: 3,
                                elevationGain: 2,
                                elevationLoss: 0,
                                grade: 3
                            }
                        })
                    });

                    elevationCorrectionModel = new TP.Model({
                        min: 100,
                        max: 2000,
                        avg: 375,
                        gain: 3032,
                        loss: 1020
                    });

                    viewContext = {
                        workoutModel: workoutModel,
                        elevationCorrectionModel: elevationCorrectionModel,
                        calculateGrade: ElevationCorrectionView.prototype.calculateGrade,
                        serializeData: ElevationCorrectionView.prototype.serializeData
                    };
                });

                it("Should correctly serialize data after elevation correction data is fetched", function()
                {

                    var serializedData = viewContext.serializeData();

                    expect(serializedData.correctedMin).to.eql(elevationCorrectionModel.get("min"));
                    expect(serializedData.correctedMax).to.eql(elevationCorrectionModel.get("max"));
                    expect(serializedData.correctedAvg).to.eql(elevationCorrectionModel.get("avg"));
                    expect(serializedData.correctedGain).to.eql(elevationCorrectionModel.get("gain"));
                    expect(serializedData.correctedLoss).to.eql(elevationCorrectionModel.get("loss"));

                });

                it("Should calculate appropriate grade", function()
                {
                    var expectedGrade = (100 * (viewContext.elevationCorrectionModel.get("gain") - viewContext.elevationCorrectionModel.get("loss")) / viewContext.workoutModel.get("distance"));
                    
                    var serializedData = viewContext.serializeData();

                    expect(serializedData.correctedGrade).to.eql(expectedGrade);
                });

                it("Should find the minimum elevation correctly, even if the elevation channel includes null values", function()
                {
                    var originalElevation = [ [ 0, null ], [ 1, 100 ], [ 2, 125 ], [ 3, 150 ], [ 4, null ] ];

                    var graphData = new GraphData({ detailData: {} });
                    sinon.stub(graphData, "getDataByAxisAndChannel").returns(originalElevation);

                    var viewContext = {
                        model: buildWorkoutModel(),
                        originalElevation: originalElevation,
                        elevationCorrectionModel: new TP.Model(),
                        findMinimumElevation: ElevationCorrectionView.prototype.findMinimumElevation,
                        addMinimumElevation: ElevationCorrectionView.prototype.addMinimumElevation,
                        _getGraphData: function() { return graphData; }
                    };

                    // The equivalent of showUpdatedElevationProfile()
                    ElevationCorrectionView.prototype.setOriginalElevation.apply(viewContext);
                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);

                    expect(series.length).to.equal(1);
                    expect(series[0].data[0][2]).to.equal(100);
                    expect(series[0].data[1][2]).to.equal(100);
                    expect(series[0].data[2][2]).to.equal(100);
                });

            });

        });
    });
