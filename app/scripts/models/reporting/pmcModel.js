define(
[
    "TP"
],
function(TP)
{
    return TP.APIModel.extend(
    {
        defaults:
        {
            workoutDay: null,
            tssActual: null,
            tssPlanned: null
        },
        
        urlRoot: function ()
        {
            return null;
        },

        initialize: function ()
        {
            
        }
    });
});