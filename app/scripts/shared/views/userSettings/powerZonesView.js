define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesTypeView",
    "hbs!shared/templates/userSettings/powerZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesTypeView,
    powerZonesTemplate
)
{

    var PowerZonesView = ZonesTypeView.extend({

        template:
        {
            type: "handlebars",
            template: powerZonesTemplate
        }

    });

    return PowerZonesView;

});

