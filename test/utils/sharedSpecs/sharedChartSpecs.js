define(
[
    "underscore",
    "TP",
    "views/dashboard/dashboardChartBuilder",
    "framework/dataManager"
],
function(
    _,
    TP,
    dashboardChartBuilder,
    DataManager
)
{
    return {

        chartSettings: function(chartAttrs)
        {
            describe("(shared) chart settings", function()
            {
                var chart, chartSettingsView;
                beforeEach(function()
                {
                    chart = dashboardChartBuilder.buildChartModel(chartAttrs, { dataManager: new DataManager() });
                    chartSettingsView = chart.createChartSettingsView();
                });

                it("should render successfully", function()
                {
                    expect(_.bind(chartSettingsView.render, chartSettingsView)).not.toThrow();
                });

                it("should have a custom title field", function()
                {
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.has("input[name=title]")).toBeTruthy();
                });

                it("should display the correct title", function()
                {
                    chart.set("title", "CUSTOM-TITLE", { silent: true });
                    chartSettingsView.render();
                    expect(chartSettingsView.$el.find("input[name=title]").val()).toEqual("CUSTOM-TITLE");
                });

                it("should save the title on close", function()
                {
                    chartSettingsView.render();
                    chartSettingsView.$el.find("input[name=title]").val("NEW-TITLE").change();
                    expect(chart.get("title")).toEqual("NEW-TITLE");
                });
            });
        }

    };
});
