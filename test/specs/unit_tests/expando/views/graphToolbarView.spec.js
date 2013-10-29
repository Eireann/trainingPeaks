requirejs(
[
    "jquery",
    "TP",
    "moment",
    "views/expando/graphToolbarView"
],
function($, TP, moment, GraphToolbarView)
{
    describe("GraphToolbarView", function()
    {
        var view;

        beforeEach(function()
        {
            var stateModel = new TP.Model();

            var workoutModel = new TP.Model({
                workoutTypeValueId: 1,
                detailData: new TP.Model({
                    availableDataChannels: ["HeartRate", "Speed", "Power", "Cadence", "Elevation"],
                    disabledDataChannels: ["Cadence"]
                })
            });

            view = new GraphToolbarView({ 
                stateModel: stateModel, 
                model: workoutModel
            });
        });

        it("Should trigger an event when the slider bar changes value", function()
        {

            view.render();

            var called = false;
            var period = null;
            view.on("filterPeriodChanged", function(p)
            {
                called = true;
                period = p;
            });

            runs(function()
            {
                view.$("input[name=filterPeriod]").val(50).change();
            });

            waitsFor(function () { return called; }, 5000);

            runs(function()
            {
                expect(called).toBe(true);
                expect(period).toBe(50);
            });
        });

        it("Should correctly serialize data for distance units", null,function()
        {
            expect(view.serializeData().speedLabel).toBe("yds");
            view.model.set({workoutTypeValueId: 3});
            expect(view.serializeData().speedLabel).toBe("mph");
        });

        describe("Button States", function()
        {            
            beforeEach(function()
            {
                view.render();
            });

            it("Should contain a button for each channel in the available data series", function()
            {
                _.each(["HeartRate", "Speed", "Power", "Cadence", "Elevation"], function(channel){
                    expect(view.$(".graphSeriesButton[data-series=" + channel + "]").length).toBe(1);
                });
            });

            it("Should not contain buttons for channels that are not in the available data series", function()
            {
                _.each(["Torque", "RightPower", "Temperature"], function(channel){
                    expect(view.$(".graphSeriesButton[data-series=" + channel + "]").length).toBe(0);
                });
            });

            it("Should disable buttons that are in the disabled data series", function()
            {
                expect(view.$(".graphSeriesButton[data-series=Cadence]").is(".graphSeriesDisabled")).toBeTruthy();
            });

            it("Should not disable buttons that are not in the disabled data series", function()
            {
                _.each(["HeartRate", "Speed", "Power", "Elevation"], function(channel){
                    expect(view.$(".graphSeriesButton[data-series=" + channel + "]").is(".graphSeriesDisabled")).toBeFalsy();
                });
            });

            it("Should update available buttons when a channel is removed", function()
            {
                view.model.get("detailData").set("availableDataChannels", ["HeartRate", "Speed", "Power", "Cadence"]);
                expect(view.$(".graphSeriesButton[data-series=Elevation]").length).toBe(0);
            });

            it("Should update disabled buttons when a channel is enabled or disabled", function()
            {
                view.model.get("detailData").set("disabledDataChannels", ["Speed"]);
                expect(view.$(".graphSeriesButton[data-series=Speed]").is(".graphSeriesDisabled")).toBeTruthy();
                expect(view.$(".graphSeriesButton[data-series=Cadence]").is(".graphSeriesDisabled")).toBeFalsy();
            });

        });
    });
});
