define(
[
    "underscore",
    "backbone.marionette",
    "hbs!templates/views/navigation"
],
function (_, Marionette, navigationViewTemplate)
{
    "use strict";

    return Marionette.ItemView.extend(
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