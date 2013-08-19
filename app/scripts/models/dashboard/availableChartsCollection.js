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
                chartType: 17,
                name: "Time In HR Zones"
            },
            {
                chartType: 24,
                name: "Time In Power Zones"
            },
            {
                chartType: 26,
                name: "Time In Speed Zones"
            }
            ]);
        }
    });

    return AvailableChartsCollection;
});
