// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "app",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs",
    "views/dashboard/dashboardChartBuilder",
    "dashboard/reportingDataManager"
],
function(
    _,
    testHelpers,
    xhrData,
    theMarsApp,
    chartUtils,
    SharedChartSpecs,
    dashboardChartBuilder,
    ReportingDataManager
    )
{

    describe("PMC Chart", function()
    {

        var chartAttributes = ({
            chartType: 32
        });

        // common tests
        SharedChartSpecs.chartSettings(chartAttributes);

        describe("PMC Settings", function()
        {
            var chart, chartSettingsView;
            beforeEach(function()
            {
                chart = dashboardChartBuilder.buildChartModel(chartAttributes, { dataManager: new ReportingDataManager() }); 
                spyOn(chart, "save");
            });

            it("Should have functional checkbox options in the tomahawk", function()
            {
                var chartOptionFields = ["showTSSPerDay", "showIntensityFactorPerDay", "showTSBFill"];

                _.each(chartOptionFields, function(fieldName)
                {
                    chart.set(fieldName, false);

                    // set to false, checkbox should be off
                    chartSettingsView = chart.createChartSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.has("input[type=checkbox]#" + fieldName)).toBeTruthy();
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).toBeFalsy();

                    // check and apply, should update model
                    chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).prop("checked", true).trigger("change");
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).toBeTruthy();
                    chartSettingsView.$el.find("button.apply").trigger("click");
                    expect(chart.get(fieldName)).toBe(true);

                    // re-render should show new value
                    chartSettingsView = chart.createChartSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).toBeTruthy();

                });
            });

            it("Should have functional numeric options in the tomahawk", function()
            {
                var chartOptionFields = ["atlStartValue", "atlConstant", "ctlStartValue", "ctlConstant"];

                _.each(chartOptionFields, function(fieldName, i)
                {
                    // initial value should show in the view
                    chart.set(fieldName, i);
                    chartSettingsView = chart.createChartSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.has("input[type=number]#" + fieldName)).toBeTruthy();
                    expect(chartSettingsView.$el.find("input[type=number]#" + fieldName).val()).toEqual(Number(i).toString());

                    // change should save in the model
                    chartSettingsView.$el.find("input[type=number]#" + fieldName).val(i + 10).trigger("change");
                    chartSettingsView.$el.find("button.apply").trigger("click");
                    expect(chart.get(fieldName)).toBe(i + 10);

                    // updated value should show in the view
                    chartSettingsView = chart.createChartSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.find("input[type=number]#" + fieldName).val()).toEqual(Number(i + 10).toString());
                });
            });
        });
    });

});
