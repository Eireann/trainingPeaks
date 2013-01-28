define(
[
    "underscore",
    "TP",
    "hbs!templates/views/userControls"
],
function (_, TP, userControlsTemplate)
{
    "use strict";

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: userControlsTemplate
        },

        ui:
        {
        },
        
        events:
        {
        },

        modelEvents:
        {
            "change": "render"
        }
    });
});