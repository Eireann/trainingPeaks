// use requirejs() here, not define(), for jasmine compatibility
requirejs(
[
    "moment",
    "jquery",
    "TP",
    "shared/models/metricModel",
    "testUtils/testHelpers"
],
function(
    moment,
    $,
    TP,
    MetricModel,
    testHelpers
)
{
    describe("Metric Model", function()
    {
        // user needs an athlete id for some of these tests to run
        beforeEach(function()
        {
            testHelpers.theApp.user.setCurrentAthleteId(1234, true);
        });

        afterEach(function()
        {
            testHelpers.theApp.user.setCurrentAthleteId(null, true);
        });

        it("Should load as a module", function()
        {
            expect(MetricModel).toBeDefined();
        });

        it("Should use id as model id", function()
        {
            var today = moment().format("YYYY-MM-DDTHH:mm:ss");
            var id = "098765";
            var metric = new MetricModel({ timeStamp: today, id: id });
            expect(metric.id).toEqual(id);
        });

        it("Should return correct calendar date", function()
        {
            var today = moment().format("YYYY-MM-DD");
            var id = "098765";
            var metric = new MetricModel({ timeStamp: today, id: id });
            expect(metric.getCalendarDay()).toEqual(moment().format("YYYY-MM-DD"));
        });

        describe("moveToDay", function()
        {
            var metric;
            var originalTimestamp = moment().format(TP.utils.datetime.longDateFormat);
            var modifiedTimestamp = moment(originalTimestamp).add("days", 1).format(TP.utils.datetime.longDateFormat);
            var originalDate = moment(originalTimestamp).format("YYYY-MM-DD");
            var modifiedDate = moment(modifiedTimestamp).format("YYYY-MM-DD");

            beforeEach(function()
            {
                testHelpers.setupFakeAjax();
                metric = new MetricModel({ id: "12345", timeStamp: originalTimestamp });
            });

            afterEach(function()
            {
                testHelpers.removeFakeAjax();
            });

            it("Should update timeStamp on success", function()
            {
                metric.moveToDay(modifiedDate);
                testHelpers.resolveRequest("PUT", "", {});
                expect(metric.getCalendarDay()).toEqual(modifiedDate);
                expect(metric.get("timeStamp")).toEqual(modifiedTimestamp);
            });

            it("Should not update timeStamp on failure", function()
            {
                metric.moveToDay(modifiedDate);
                testHelpers.rejectRequest("PUT", "");
                expect(metric.getCalendarDay()).toEqual(originalDate);
                expect(metric.get("timeStamp")).toEqual(originalTimestamp);
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
                    expect(MetricModel.prototype.cloneForCopy).toBeDefined();
                    expect(typeof MetricModel.prototype.cloneForCopy).toBe("function");

                });

                it("Should return a MetricModel", function()
                {
                    var result = metric.cloneForCopy();
                    expect(metric instanceof MetricModel).toBe(true);
                });

                it("Should have the same attributes (except id)", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    expect(copiedMetric.attributes).toEqual(_.omit(metric.attributes, "id"));
                });
            });

            describe("pasted", function()
            {
                it("Should implement an pasted method", function()
                {
                    expect(MetricModel.prototype.pasted).toBeDefined();
                    expect(typeof MetricModel.prototype.pasted).toBe("function");
                });

                it("Should call moveToDay when pasting an existing metric from cut", function()
                {
                    var cutMetric = metric;
                    spyOn(cutMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutMetric.pasted({ date: dateToPasteTo });
                    expect(cutMetric.moveToDay).toHaveBeenCalledWith(dateToPasteTo);
                });

                it("Should not call moveToDay when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    spyOn(copiedMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    expect(copiedMetric.moveToDay).not.toHaveBeenCalled();
                });

                it("Should return a new metric when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = copiedMetric.pasted({ date: dateToPasteTo });
                    expect(pastedMetric instanceof MetricModel).toBe(true);
                    expect(pastedMetric).not.toBe(copiedMetric);
                });

                it("Should set the correct date on pasted metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = copiedMetric.pasted({ date: dateToPasteTo });
                    expect(pastedMetric.getCalendarDay()).toBe(dateToPasteTo);
                });

                it("Should not change the date of the copied metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    var pastedMetric = copiedMetric.pasted({ date: dateToPasteTo });
                    expect(copiedMetric.getCalendarDay()).not.toBe(dateToPasteTo);
                    expect(copiedMetric.getCalendarDay()).toBe(moment(metricAttributes.timeStamp).format("YYYY-MM-DD"));
                });

            });

        });
    });

});
