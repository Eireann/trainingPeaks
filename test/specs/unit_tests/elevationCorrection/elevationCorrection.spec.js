requirejs(
[
    "underscore",
    "jquery",
    "TP",
    "views/elevationCorrection/elevationCorrectionView",
    "utilities/charting/dataParser"
],
    function (_, $, TP, ElevationCorrectionView, DataParser)
    {
        function buildWorkoutModel()
        {
            return new TP.Model(
                {
                    details: new TP.Model(),
                    detailData: new TP.Model({ flatSamples: { hasLatLngData: true, channelMask: ["Elevation"]} })
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

                    expect(constructorWithNoOptions).toThrow();
                    expect(constructorWithNoDetailData).toThrow();
                });

                it("Should not throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function()
                {
                    var constructorWithOptions = function()
                    {
                        ElevationCorrectionView.prototype.validateWorkoutModel({ workoutModel: buildWorkoutModel() });
                    };

                    expect(constructorWithOptions).not.toThrow();
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
                    expect(series.length).toBe(1);
                    expect(series[0].data).toBe(originalElevation);
                });
 
                it("Should contain corrected elevation if it is available", function()
                {
                    var originalElevation = [100, 102, 110];
                    var correctedElevation = [103, 105, 114];
                    var dataParser = new DataParser();

                    spyOn(dataParser, "createCorrectedElevationChannel").andReturn(correctedElevation);

                    var viewContext = {
                        originalElevation: originalElevation,
                        elevationCorrectionModel: new TP.Model({elevations: correctedElevation}),
                        dataParser: dataParser
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).toBe(2);
                    expect(series[0].data).toBe(originalElevation);
                    expect(series[1].data).toBe(correctedElevation);
                });
            });

            describe("Show corrected elevation", function()
            {

                var workoutModel, elevationCorrectionModel, viewContext;

                beforeEach(function()
                {
                    var workoutModel = new TP.Model({
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

                    expect(serializedData.correctedMin).toEqual(elevationCorrectionModel.get("min"));
                    expect(serializedData.correctedMax).toEqual(elevationCorrectionModel.get("max"));
                    expect(serializedData.correctedAvg).toEqual(elevationCorrectionModel.get("avg"));
                    expect(serializedData.correctedGain).toEqual(elevationCorrectionModel.get("gain"));
                    expect(serializedData.correctedLoss).toEqual(elevationCorrectionModel.get("loss"));

                });

                it("Should calculate appropriate grade", null, function()
                {
                    ElevationCorrectionView.prototype.showCorrectedElevation.apply(viewContext);
                    var expectedGrade = 20.12;
                    expect(viewModel.get("correctedGrade")).toEqual(expectedGrade);
                });

            });

        });
    });
