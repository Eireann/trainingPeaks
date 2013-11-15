define(
[
    "jquery",
    "TP",
    "leaflet",
    "hbs!templates/helpers/mapping/mileMarkerIcon",
    "hbs!templates/helpers/mapping/startMarkerIcon",
    "hbs!templates/helpers/mapping/finishMarkerIcon"
],
function(
    $,
    TP,
    L,
    mileMarkerIconTemplate,
    startMarkerIconTemplate,
    finishMarkerIconTemplate
    )
{

    return {

        MileMarker: L.DivIcon.extend(
            {
                options: {
                    riseOnHover: true
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
            }),

        StartMarker: L.DivIcon.extend(
            {
                options: {
                    riseOnHover: true
                },

                initialize: function(options)
                {
                    return;
                },

                createIcon: function()
                {
                    return $(startMarkerIconTemplate(this.options.options))[0];
                },

                createShadow: function()
                {
                    return null;
                }
            }),

        FinishMarker: L.DivIcon.extend(
            {
                options: {
                    riseOnHover: true
                },

                initialize: function(options)
                {
                    return;
                },

                createIcon: function()
                {
                    return $(finishMarkerIconTemplate(this.options.options))[0];
                },

                createShadow: function()
                {
                    return null;
                }
            })

    };
});
