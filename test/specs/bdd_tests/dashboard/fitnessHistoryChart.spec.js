define(
[
    "jquery",
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "TP",
    "shared/models/userModel",
    "views/dashboard/chartUtils",
    "views/dashboard/dashboardChartBuilder",
    "framework/dataManager",
    "testUtils/sharedSpecs/sharedChartSpecs"
],
function(
    $,
    _,
    testHelpers,
    xhrData,
    TP,
    UserModel,
    chartUtils,
    dashboardChartBuilder,
    DataManager,
    SharedChartSpecs
    )
{

    describe("Fitness History Chart", function()
    {

        var chartAttrs = { chartType: 35 };

        SharedChartSpecs.chartSettings(chartAttrs);

        describe("KJ column", function()
        {

            var chart, chartContentView, dataManager, dataDeferred;
            beforeEach(function()
            {
                var user = new UserModel();
                user.setCurrentAthlete(new TP.Model({athleteId: 1 }));

                dataManager = new DataManager({ user: user });

                chart = dashboardChartBuilder.buildChartModel(chartAttrs, { dataManager: dataManager });
                chartContentView = chart.createContentView({ model: chart });

                dataDeferred = new $.Deferred();

                sinon.stub(dataManager, "_requestAjaxData").returns(dataDeferred);
                chartContentView.render();
                chartContentView.$el.append($("<div>").addClass("podContent"));
            });

            it("should render a table", function()
            {
                dataDeferred.resolve();
                expect(chartContentView.$("table").length).to.eql(1);
            });

            it("Should display KJ column if peak type is power", function()
            {
                chart.set("peakType", 4);
                dataDeferred.resolve();
                expect(chartContentView.$el.text().toLowerCase()).to.contain("kj");
            });

            it("Should not display KJ column if peak type is not power", function()
            {
                chart.set("peakType", 3);
                dataDeferred.resolve();
                expect(chartContentView.$el.text().toLowerCase()).to.not.contain("kj");
            });

        });

    });

});
