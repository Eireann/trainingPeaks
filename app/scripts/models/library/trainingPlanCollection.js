define(
[
    "TP"
],
function(TP)
{
    return TP.Collection.extend(
    {
        model: TP.Model,
        cacheable: true,

        url: function()
        {
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + theMarsApp.user.getCurrentAthleteId();
        }

    });
});