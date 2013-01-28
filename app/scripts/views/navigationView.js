define(
[
    "underscore",
    "TP",
    "hbs!templates/views/navigation"
],
function(_, TP, navigationViewTemplate)
{
    "use strict";

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: navigationViewTemplate
        },

        ui:
        {
        },
        
        events:
        {
        }
    });
});