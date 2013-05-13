define(
[
    "TP",
    "hbs!templates/views/quickView/expandedView/graphToolbar"
],
function(TP, graphToolbarTemplate)
{
    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: graphToolbarTemplate
        },
        
        initialize: function(optinos)
        {
            
        },
        
        onRender: function()
        {
            
        }
    });
});