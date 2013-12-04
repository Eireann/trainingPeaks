define(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs"
],
function(
    _,
    testHelpers,
    xhrData,
    TP,
    chartUtils,
    SharedChartSpecs
    )
{

    describe("Fitness History Chart", function()
    {

        SharedChartSpecs.chartSettings(
        {
            chartType: 35
        });

    });

});
