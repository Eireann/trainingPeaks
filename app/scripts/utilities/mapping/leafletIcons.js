define(
[
    "TP",
    "leaflet",
    "hbs!templates/helpers/mileMarkerIcon"
],
function(
    TP,
    Leaflet,
    mileMarkerIconTemplate
    )
{

    return {

        MileMarker: L.DivIcon.extend(
            {
                options: {
                    /*
                    number: (String) (required)
                    title: (String) (optional)
                    */
                },

                initialize: function(options)
                {
                    L.Util.setOptions(this, options);
                },

                createIcon: function()
                {
                    return $(mileMarkerIconTemplate(this.options.options))[0];
                },

                createShadow: function()
                {
                    return null;
                }
            })

    };
});