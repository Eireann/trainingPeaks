define(
[
    "TP"
],
function(
    TP)
{
    var AvailableChartsCollection = TP.Collection.extend(
    {
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
            }]);
        }
    });

    return AvailableChartsCollection;
});
