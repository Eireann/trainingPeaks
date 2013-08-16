define(
[
    "TP"
],
function(
    TP)
{
    var AvailableChartsCollection = TP.Collection.extend(
    {
        model: TP.Model,

        initialize: function()
        {
            this.add([
            {
                chartType: 32,
                name: "PMC"
            },
            {
                chartType: 3,
                name: "Fitness Summary"
            },
            {
                chartType: 8,
                name: "Peak Power"
            },
            {
                chartType: 28,
                name: "Peak HR"
            },
            {
                chartType: 30,
                name: "Peak Speed"
            },
            {
                chartType: 31,
                name: "Peak Pace"
            }]);
        }
    });

    return AvailableChartsCollection;
});
