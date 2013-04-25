define(
[
    "TP",
    "hbs!templates/views/quickView/mapAndGraphView"
],
function (TP, workoutQuickViewMapAndGraphTemplate)
{
    
    var mapAndGraphViewBase = 
    {
        className: "mapAndGraph",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: workoutQuickViewMapAndGraphTemplate
        },

        initialize: function()
        {
        }
    };

    return TP.ItemView.extend(mapAndGraphViewBase);
});
