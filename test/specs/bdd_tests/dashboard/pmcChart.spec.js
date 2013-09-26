// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs"
],
function(
    _,
    testHelpers,
    xhrData,
    theMarsApp,
    chartUtils,
    SharedChartSpecs
    )
{

    describe("PMC Chart", function()
    {

        SharedChartSpecs.chartSettings(
        {
            chartType: 32
        });

    });

});
