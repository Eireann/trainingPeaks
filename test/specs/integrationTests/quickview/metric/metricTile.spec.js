define(
[
    "shared/models/userModel",
    "calendar/views/metricTileView",
    "shared/models/metricModel"
],
function(
    UserModel,
    MetricTileView,
    MetricModel
)
{

    describe("metric tile view", function()
    {

        var model, view;
        beforeEach(function()
        {
            model = new MetricModel({ id: 1, athleteId: 1, timeStamp: "2014-01-31T00:00:00" });
            view = new MetricTileView({ model: model, user: new UserModel(), userSettingsMetricOrder: [10, 4, 1] });
        });

        it("Should display a time if the timestamp is not 12:00 AM", function()
        {
            model.setTimestamp("1:35 PM");
            view.render();
            expect(view.$el.text()).to.contain("1:35");
        });

        it("Should not display a time if the timestamp is 12:00 AM", function()
        {
            view.render();
            expect(view.$el.text()).to.not.contain("12:00");
        });

        it("Should display only one metric value", function()
        {
            model.set("details", [
                      { type: 4, value: 1 },
                      { type: 10, value: 10 }
            ]);

            view.render();
            expect(view.$el.text()).to.contain("Sleep Quality");
            expect(view.$el.text()).to.not.contain("Overall Feeling");
        });

        it("Should indicate if there are more metric values to view", function()
        {
            model.set("details", [
                      { type: 10, value: 10 },
                      { type: 4, value: 1 },
                      { type: 1, value: 3 }
            ]);

            view.render();
            expect(view.$el.text()).to.contain("2 more");
        });
    });


});

