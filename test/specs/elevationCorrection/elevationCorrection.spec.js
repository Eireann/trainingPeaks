requirejs(
[
    "underscore",
    "jquery",
    "TP",
    "views/elevationCorrection/elevationCorrectionView"
],
    function (_, $, TP, ElevationCorrectionView)
    {
        describe("Elevation Correction", function ()
        {
            xit("Should throw an exception because ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel", function ()
            {
                new ElevationCorrectionView({});
            });
        });
    });