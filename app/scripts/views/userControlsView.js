define(
[
    "underscore",
    "backbone.marionette",
    "hbs!templates/views/userControls"
],
function (_, Marionette, userControlsTemplate)
{
    "use strict";

    return Marionette.ItemView.extend(
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