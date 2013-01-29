define(
[
    "TP",
    "app"
],
function(TP, theApp)
{
    return TP.Model.extend(
    {

        url: function()
        {
            return theApp.apiRoot + "/WebApiServer/Fitness/V1/workouts";
        }

    });
});