define(
[
    "underscore",
    "testUtils/testHelpers",
    "testUtils/xhrDataStubs",
    "views/dashboard/chartUtils",
    "testUtils/sharedSpecs/sharedChartSpecs",
    "views/dashboard/dashboardChartBuilder",
    "framework/dataManager"
],
function(
    _,
    testHelpers,
    xhrData,
    chartUtils,
    SharedChartSpecs,
    dashboardChartBuilder,
    DataManager
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
                chart = dashboardChartBuilder.buildChartModel(chartAttributes, { dataManager: new DataManager() }); 
                sinon.stub(chart, "save");
            });

            it("Should have functional checkbox options in the tomahawk", function()
            {
                var chartOptionFields = ["showTSSPerDay", "showIntensityFactorPerDay", "showTSBFill"];

                _.each(chartOptionFields, function(fieldName)
                {
                    chart.set(fieldName, false);

                    // set to false, checkbox should be off
                    chartSettingsView = chart.createSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.has("input[type=checkbox]#" + fieldName)).to.be.ok;
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).to.not.be.ok;

                    // check and apply, should update model
                    chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).prop("checked", true).trigger("change");
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).to.be.ok;
                    chartSettingsView.$el.find("button.apply").trigger("click");
                    expect(chart.get(fieldName)).to.equal(true);

                    // re-render should show new value
                    chartSettingsView = chart.createSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.find("input[type=checkbox]#" + fieldName).is(":checked")).to.be.ok;

                });
            });

            it("Should have functional numeric options in the tomahawk", function()
            {
                var chartOptionFields = ["atlStartValue", "atlConstant", "ctlStartValue", "ctlConstant"];

                _.each(chartOptionFields, function(fieldName, i)
                {
                    // initial value should show in the view
                    chart.set(fieldName, i);
                    chartSettingsView = chart.createSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.has("input[type=number]#" + fieldName)).to.be.ok;
                    expect(chartSettingsView.$el.find("input[type=number]#" + fieldName).val()).to.eql(Number(i).toString());

                    // change should save in the model
                    chartSettingsView.$el.find("input[type=number]#" + fieldName).val(i + 10).trigger("change");
                    chartSettingsView.$el.find("button.apply").trigger("click");
                    expect(chart.get(fieldName)).to.equal(i + 10);

                    // updated value should show in the view
                    chartSettingsView = chart.createSettingsView();
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.find("input[type=number]#" + fieldName).val()).to.eql(Number(i + 10).toString());
                });
            });
        });
    });

});
