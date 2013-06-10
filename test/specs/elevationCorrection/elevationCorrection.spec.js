﻿requirejs(
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
            it("Should throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function ()
            {
                var constructorWithNoOptions = function ()
                {
                    ElevationCorrectionView.prototype.validateWorkoutModel({});
                };

                var constructorWithNoDetailData = function ()
                {
                    ElevationCorrectionView.prototype.validateWorkoutModel({ workoutModel: new TP.Model() });
                };

                expect(constructorWithNoOptions).toThrow();
                expect(constructorWithNoDetailData).toThrow();
            });

            it("Should not throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function ()
            {
                var constructorWithOptions = function ()
                {
                    ElevationCorrectionView.prototype.validateWorkoutModel({ workoutModel: buildWorkoutModel() });
                };

                expect(constructorWithOptions).not.toThrow();
            });

            describe("Plot Rendering", function()
            {
                
                it("Should contain original elevation", function()
                {
                    var originalElevation = [100, 102, 110];
                    var viewContext = {
                        originalElevation: originalElevation
                    };

                    var series = ElevationCorrectionView.prototype.buildPlotSeries.apply(viewContext);
                    expect(series.length).toBe(1);
                    expect(series[0].data).toBe(originalElevation);
                });
 
                it("Should contain corrected elevation if it is available", function()
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

            describe("Show corrected elevation", function()
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
                    var expectedGrade = (100 * (3032 - 1020) / 10000).toFixed(1);
                    console.log(expectedGrade);
                    expect(viewModel.get("correctedGrade")).toEqual(expectedGrade);
                });

                /*
        showCorrectedElevation: function()
        {
            this.model.set(
            {
                correctedMin: this.elevationCorrectionModel.get("min"),
                correctedAvg: this.elevationCorrectionModel.get("avg"),
                correctedMax: this.elevationCorrectionModel.get("max"),
                correctedGain: this.elevationCorrectionModel.get("gain"),
                correctedLoss: this.elevationCorrectionModel.get("loss"),
                correctedGrade: this.calculateGrade(this.elevationCorrectionModel.get("gain"), this.elevationCorrectionModel.get("loss"), this.workoutModel.get("distance"))
            });
        },
                */
            });

        });
    });