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

        });
    });