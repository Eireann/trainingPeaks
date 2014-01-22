define(
[
    "jquery",
    "TP",
    "moment",
    "models/workoutModel",
    "views/expando/graphToolbarView"
],
function($, TP, moment, WorkoutModel, GraphToolbarView)
{
    describe("GraphToolbarView", function()
    {
        var view;

        beforeEach(function()
        {
            var stateModel = new TP.Model();

            var workoutModel = new WorkoutModel({
                workoutTypeValueId: 1
            });

            workoutModel.get("detailData").set({
                availableDataChannels: ["HeartRate", "Speed", "Power", "Cadence", "Elevation", "Distance"],
                disabledDataChannels: ["Cadence"]
            });

            view = new GraphToolbarView({
                stateModel: stateModel,
                model: workoutModel,
                featureAuthorizer: {
                    runCallbackOrShowUpgradeMessage: function(checker, callback)
                    {
                        callback();
                    },
                    features: {
                        ExpandoDataEditing: null
                    }
                }
            });
        });

        it("Should trigger an event when the slider bar changes value", function(done)
        {

            view.render();

            var called = false;
            var period = null;
            view.on("filterPeriodChanged", function(p)
            {
                called = true;
                period = p;
            });

            Q()
            .then(function()
            {
                view.$("input[name=filterPeriod]").val(50).change();
            })
            .until(function () { return called; })
            .then(function()
            {
                expect(called).to.equal(true);
                expect(period).to.equal(50);
            })
            .nodeify(done);

        });

        it("Should display correct button label for distance units", function()
        {
            // defaults to metric units unless we have specified units for app user

            // for swim
            expect(view.serializeData().speedLabel).to.equal("sec/100m");

            // for bike
            view.model.set({workoutTypeValueId: 2});
            expect(view.serializeData().speedLabel).to.equal("kph");
        });

        describe("Channel Button States", function()
        {
            beforeEach(function()
            {
                view.render();
            });

            it("Should contain a button for each channel in the available data series", function()
            {
                _.each(["HeartRate", "Speed", "Power", "Cadence", "Elevation"], function(channel){
                    expect(view.$("button[data-series=" + channel + "]").length).to.equal(1);
                });
            });

            it("Should not contain buttons for channels that are not in the available data series", function()
            {
                _.each(["Torque", "RightPower", "Temperature"], function(channel){
                    expect(view.$("button[data-series=" + channel + "]").length).to.equal(0);
                });
            });

            it("Should disable buttons that are in the disabled data series", function()
            {
                expect(view.$("button[data-series=Cadence]").is(".seriesDisabled")).to.be.ok;
            });

            it("Should not disable buttons that are not in the disabled data series", function()
            {
                _.each(["HeartRate", "Speed", "Power", "Elevation"], function(channel){
                    expect(view.$("button[data-series=" + channel + "]").is(".seriesDisabled")).to.not.be.ok;
                });
            });

            it("Should update available buttons when a channel is removed", function()
            {
                view.model.get("detailData").set("availableDataChannels", ["HeartRate", "Speed", "Power", "Cadence"]);
                expect(view.$("button[data-series=Elevation]").length).to.equal(0);
            });

            it("Should update disabled buttons when a channel is enabled or disabled", function()
            {
                view.model.get("detailData").set("disabledDataChannels", ["Speed"]);
                expect(view.$("button[data-series=Speed]").is(".seriesDisabled")).to.be.ok;
                expect(view.$("button[data-series=Cadence]").is(".seriesDisabled")).to.not.be.ok;
            });

        });

        describe("Time and Distance Button States", function()
        {
            beforeEach(function()
            {
                view.render();
            });

            it("Should change active x axis when clicking on distance button", function()
            {
                view.$(".distance").trigger("click");
                expect(view._getGraphData().xaxis).to.eql("distance");
                expect(view.$(".distance").is(".bold")).to.be.ok;
                expect(view.$(".time").is(".bold")).to.not.be.ok
            });

            it("Should change active x axis when clicking time button", function()
            {
                view.$(".distance").trigger("click");
                view.$(".time").trigger("click");
                expect(view._getGraphData().xaxis).to.eql("time");
                expect(view.$(".distance").is(".bold")).to.not.be.ok;
                expect(view.$(".time").is(".bold")).to.be.ok
            });

            it("Should retain the x axis state when a channel is removed", function()
            {
                view.$(".distance").trigger("click");
                view.model.get("detailData").set("availableDataChannels", ["Speed", "Power", "Distance"]);
                expect(view._getGraphData().xaxis).to.eql("distance");
                expect(view.$(".distance").is(".bold")).to.be.ok;
                expect(view.$(".time").is(".bold")).to.not.be.ok
            });

        })
    });
});
