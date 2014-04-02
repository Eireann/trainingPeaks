define(
[
    "underscore",
    "moment",
    "shared/models/metricModel"
],
function(
    _,
    moment,
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

        it("Should load as a module", function()
        {
            expect(MetricModel).to.not.be.undefined;
        });

        it("Should use id as model id", function()
        {
            var today = moment().format("YYYY-MM-DDTHH:mm:ss");
            var id = "098765";
            var metric = new MetricModel({ timeStamp: today, id: id });
            expect(metric.id).to.eql(id);
        });

        it("Should return correct calendar date", function()
        {
            var today = moment().format("YYYY-MM-DD");
            var id = "098765";
            var metric = new MetricModel({ timeStamp: today, id: id });
            expect(metric.getCalendarDay()).to.eql(moment().format("YYYY-MM-DD"));
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


        describe("Cut, Copy, Paste", function()
        {
            var metric;
            var metricAttributes = {
                "id": 12345,
                "athleteId": 67890,
                "timeStamp": moment().format("YYYY-MM-DDTHH:mm:ss"),
                "details": []
            };
            var attributesToCopy = [
                "athleteId",
                "timeStamp",
                "details"
            ];

            beforeEach(function()
            {
                metric = new MetricModel(metricAttributes);
            });

            describe("cloneForCopy", function()
            {
                it("Should implement a cloneForCopy method", function()
                {
                    expect(MetricModel.prototype.cloneForCopy).to.not.be.undefined;
                    expect(typeof MetricModel.prototype.cloneForCopy).to.equal("function");

                });

                it("Should return a MetricModel", function()
                {
                    var result = metric.cloneForCopy();
                    expect(metric instanceof MetricModel).to.equal(true);
                });

                it("Should have the same attributes (except id)", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    expect(copiedMetric.attributes).to.eql(_.omit(metric.attributes, "id"));
                });
            });

            describe("pasted", function()
            {

               var activityMover, metric; 
                beforeEach(function()
                {
                    activityMover = { pasteActivityToDay: sinon.stub() };
                    metric = new MetricModel(metricAttributes, { activityMover: activityMover });
                });

                it("Should implement a pasted method", function()
                {
                    expect(MetricModel.prototype.pasted).to.not.be.undefined;
                    expect(typeof MetricModel.prototype.pasted).to.equal("function");
                });

                it("Should call activityMover.pasteActivityToDay", function()
                {
                    metric.pasted({ date: "2014-01-01" });
                    expect(activityMover.pasteActivityToDay).to.have.been.calledWith(metric, "2014-01-01");
                });

            });

        });


    });


});

