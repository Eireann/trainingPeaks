define(
[
    "underscore",
    "TP",
    "backbone",
    "shared/views/userSettings/zonesTypeView",
    "hbs!shared/templates/userSettings/heartRateZonesTemplate"
],
function(
    _,
    TP,
    Backbone,
    ZonesTypeView,
    heartRateZonesTemplate
)
{

    var PowerZonesView = ZonesTypeView.extend({

        template:
        {
            type: "handlebars",
            template: heartRateZonesTemplate
        }

    });

    return PowerZonesView;

});


