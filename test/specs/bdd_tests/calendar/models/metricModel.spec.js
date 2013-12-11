define(
[
    "moment",
    "jquery",
    "TP",
    "shared/models/metricModel",
    "testUtils/xhrDataStubs",
    "testUtils/testHelpers"
],
function(
    moment,
    $,
    TP,
    MetricModel,
    xhrData,
    testHelpers
)
{
    describe("Metric Model", function()
    {

        beforeEach(function()
        {
            testHelpers.startTheAppAndLogin(xhrData.users.barbkprem);
        });

        afterEach(function()
        {
            testHelpers.stopTheApp();
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

            it("should correctly handle moving from 31st to month with only 30 days", function()
            {
                metric.set("timeStamp", "2013-10-31T14:12:10");
                metric.moveToDay("2013-11-01");
                testHelpers.resolveRequest("PUT", "", {});
                expect(metric.getCalendarDay()).to.eql("2013-11-01");
                expect(metric.get("timeStamp")).to.eql("2013-11-01T14:12:10"); 
            });

            it("Should update timeStamp on success", function()
            {
                metric.moveToDay(modifiedDate);
                testHelpers.resolveRequest("PUT", "", {});
                expect(metric.getCalendarDay()).to.eql(modifiedDate);
                expect(metric.get("timeStamp")).to.eql(modifiedTimestamp);
            });

            it("Should not update timeStamp on failure", function()
            {
                metric.moveToDay(modifiedDate);
                testHelpers.rejectRequest("PUT", "");
                expect(metric.getCalendarDay()).to.eql(originalDate);
                expect(metric.get("timeStamp")).to.eql(originalTimestamp);
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
                sinon.spy(testHelpers.theApp.calendarManager, "addItem");
                testHelpers.theApp.user.setCurrentAthlete(67890, new TP.Model());
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
                it("Should implement an pasted method", function()
                {
                    expect(MetricModel.prototype.pasted).to.not.be.undefined;
                    expect(typeof MetricModel.prototype.pasted).to.equal("function");
                });

                it("Should call moveToDay when pasting an existing metric from cut", function()
                {
                    var cutMetric = metric;
                    sinon.stub(cutMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutMetric.pasted({ date: dateToPasteTo });
                    expect(cutMetric.moveToDay).to.have.been.calledWith(dateToPasteTo);
                });
                
                it("Should not call moveToDay when pasting an existing metric from cut to a different athlete", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(42, new TP.Model());
                    var cutMetric = metric;
                    sinon.stub(cutMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    cutMetric.pasted({ date: dateToPasteTo });
                    expect(cutMetric.moveToDay).to.not.have.been.called;
                });

                it("Should not call moveToDay when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    sinon.stub(copiedMetric, "moveToDay");
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    expect(copiedMetric.moveToDay).to.not.have.been.called;
                });

                it("Should return a new metric when pasting a metric from copy", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric instanceof MetricModel).to.equal(true);
                    expect(pastedMetric).to.not.equal(copiedMetric);
                });

                it("Should set the correct date on pasted metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric.getCalendarDay()).to.equal(dateToPasteTo);
                });

                it("Should not change the date of the copied metric", function()
                {
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedMetric.getCalendarDay()).to.not.equal(dateToPasteTo);
                    expect(copiedMetric.getCalendarDay()).to.equal(moment(metricAttributes.timeStamp).format("YYYY-MM-DD"));
                });
                
                it("Should set the correct athleteId on pasted metric", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(42, new TP.Model());
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(pastedMetric.get("athleteId")).to.equal(42);
                });

                it("Should not change the date of the copied metric", function()
                {
                    testHelpers.theApp.user.setCurrentAthlete(42, new TP.Model());
                    var copiedMetric = metric.cloneForCopy();
                    var dateToPasteTo = "2012-10-10";
                    copiedMetric.pasted({ date: dateToPasteTo });
                    var pastedMetric = testHelpers.theApp.calendarManager.addItem.firstCall.args[0];
                    expect(copiedMetric.get("athleteId")).to.not.equal(42);
                });

            });

        });
    });

});
