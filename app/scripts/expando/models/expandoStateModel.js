define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
)
{

    var ExpandoStateModel = TP.Model.extend(
    {

        initialize: function()
        {
            this.set("ranges", new TP.Collection());
        }

    });

    return ExpandoStateModel;

});
