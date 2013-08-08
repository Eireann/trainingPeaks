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
            this.add(
            {
                id: 32,
                name: "PMC"
            });
        }
    });

    return AvailableChartsCollection;
});
