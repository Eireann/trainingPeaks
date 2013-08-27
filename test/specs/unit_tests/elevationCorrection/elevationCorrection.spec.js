requirejs(
[
    "underscore",
    "jquery",
    "TP",
    "views/elevationCorrection/elevationCorrectionView"
],
    function (_, $, TP, ElevationCorrectionView)
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

                xit("Should build a model for template rendering", function()
                {
                    var stats = {
                        minimumElevation: 5,
                        averageElevation: 10,
                        maximumElevation: 15,
                        elevationGain: 11,
                        elevationLoss: 13,
                        grade: 0.2123
                    };

                    var detailData = new TP.Model({ totalStats: stats });
                    var viewContext = {
                        workoutModel: new TP.Model({ detailData: detailData })
                    };

                    ElevationCorrectionView.prototype.buildViewModel.apply(viewContext);

                    expect(viewContext.model).toBeDefined();
                    expect(viewContext.model.get("originalMin")).toEqual(stats.minimumElevation);
                    expect(viewContext.model.get("originalAvg")).toEqual(stats.averageElevation);
                    expect(viewContext.model.get("originalMax")).toEqual(stats.maximumElevation);
                    expect(viewContext.model.get("originalGain")).toEqual(stats.elevationGain);
                    expect(viewContext.model.get("originalLoss")).toEqual(stats.elevationLoss);
                    expect(viewContext.model.get("originalGrade")).toEqual(stats.grade);
                });
            });

            describe("Plot Rendering", function()
            {
                
                xit("Should contain original elevation", function()
                {
                    var originalElevation = [100, 102, 110];
                    var viewContext = {
                        originalElevation: originalElevation
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).toBe(1);
                    expect(series[0].data).toBe(originalElevation);
                });
 
                xit("Should contain corrected elevation if it is available", function()
                {
                    var originalElevation = [100, 102, 110];
                    var correctedElevation = [103, 105, 114];
                    var viewContext = {
                        originalElevation: originalElevation,
                        correctedElevation: correctedElevation
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).toBe(2);
                    expect(series[0].data).toBe(originalElevation);
                    expect(series[1].data).toBe(correctedElevation);
                });
            });

            xdescribe("Show corrected elevation", function()
            {

                var viewModel, workoutModel, elevationCorrectionModel, viewContext;

                beforeEach(function()
                {
                    viewModel = new TP.Model();

                    workoutModel = new TP.Model({
                        distance: 10000
                    });

                    elevationCorrectionModel = new TP.Model({
                        min: 100,
                        max: 2000,
                        avg: 375,
                        gain: 3032,
                        loss: 1020
                    });

                    viewContext = {
                        model: viewModel,
                        workoutModel: workoutModel,
                        elevationCorrectionModel: elevationCorrectionModel,
                        calculateGrade: ElevationCorrectionView.prototype.calculateGrade
                    };
                });

                it("Should set appropriate model attributes after elevation correction data is fetched", function()
                {

                    ElevationCorrectionView.prototype.showCorrectedElevation.apply(viewContext);
                
                    expect(viewModel.get("correctedMin")).toEqual(elevationCorrectionModel.get("min"));
                    expect(viewModel.get("correctedMax")).toEqual(elevationCorrectionModel.get("max"));
                    expect(viewModel.get("correctedAvg")).toEqual(elevationCorrectionModel.get("avg"));
                    expect(viewModel.get("correctedGain")).toEqual(elevationCorrectionModel.get("gain"));
                    expect(viewModel.get("correctedLoss")).toEqual(elevationCorrectionModel.get("loss"));

                });

                it("Should calculate appropriate grade", function()
                {
                    ElevationCorrectionView.prototype.showCorrectedElevation.apply(viewContext);
                    var expectedGrade = 20.12;
                    expect(viewModel.get("correctedGrade")).toEqual(expectedGrade);
                });

            });

        });
    });
