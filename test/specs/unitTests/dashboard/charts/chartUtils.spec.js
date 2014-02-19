define(
[
    "views/dashboard/chartUtils"
],
function(
    ChartUtils
)
{
    describe("Chart Date Utils", function()
    {

        it("should disregard time component of datetime strings and treat all dates as local", function()
        {

            var options = {
                quickDateSelectOption: 2,
                startDate: "2013-01-01T03:59:59-00:00",
                endDate: "2013-03-30"
            };

            var chartParameters = ChartUtils.buildChartParameters(options);

            expect(chartParameters.startDate.format("YYYY-MM-DD")).to.eql("2013-01-01");
            expect(chartParameters.endDate.format("YYYY-MM-DD")).to.eql("2013-03-30");
        });

    });
});
