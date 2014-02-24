define(
[
    "underscore",
    "shared/models/metricModel"
],
function(
    _,
    MetricModel
)
{

    describe("Metric Model", function()
    {

        var model;
        beforeEach(function()
        {
            model = new MetricModel();
            model.set("details", [
                { type: 10, value: 1},
                { type: 11, value: 2},
                { type: 4, value: 3}
            ]);
        });

        describe("getKeyStatField", function()
        {

            it("Should have  getKeyStatField method", function()
            {
                expect(_.isFunction(model.getKeyStatField)).to.be.ok;
            });

            it("Should sort data based on user preferences", function()
            {
                var userSettingsMetricOrder = [5,6,4,11,10];
                expect(model.getKeyStatField(userSettingsMetricOrder)).to.eql({ type: 4, value: 3});
            });
        });

    });


});

