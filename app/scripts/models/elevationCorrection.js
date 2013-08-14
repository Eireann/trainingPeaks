define(
[
    "TP"
],
function(TP)
{
    return TP.APIDeepModel.extend(
    {
        webAPIModelName: "Workout",
        validateIdAttribute: function () { },

        url: function ()
        {
            return theMarsApp.apiRoot + "/groundcontrol/v1/elevations";
        },
        
        defaults:
        {
            latLngs: "",
            elevations: "",
            min: null,
            max: null,
            avg: null,
            gain: null,
            loss: null
        },
        
        initialize: function(attributes, options)
        {
            if (!options.latLngArray)
                throw new Error("ElevationCorrectionModel requires a LatLong array at construction");
            
            var serializedLatLng = "";
            _.each(options.latLngArray, function (latLong)
            {
                serializedLatLng += latLong[0] + " ";
                serializedLatLng += latLong[1] + " ";
            });

            serializedLatLng = serializedLatLng.trim();

            this.set("latLngs", serializedLatLng, { silent: true });
        },
        
        parse: function (response)
        {
            if (!response || !response.elevations)
                return null;

            var parsedElevations = _.map(response.elevations.split(" "), function(elevation)
            {
                return (elevation !== null ? elevation / 100 : null);
            });

            response.elevations = parsedElevations;

            return response;
        }
    });
});