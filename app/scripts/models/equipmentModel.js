define(
[
    "underscore",
    "backbone",
    "TP"
],
function (
    _,
    Backbone,
    TP
)
{
    var EquipmentModel = TP.APIBaseModel.extend(
    {
        webAPIModelName: "EquipmentBase",
        idAttribute: "equipmentId",

        CrankLengths: [
            150,
            152,
            155,
            158,
            160,
            162.5,
            165,
            167.5,
            170,
            172.5,
            175,
            177.5,
            180,
            185,
            190,
            195,
            200,
            205,
            210,
            215,
            220
        ],

        defaults:
        {
            equipmentId: null,
            name: null,
            notes: null,
            brand: null,
            model: null,
            dateOfPurchase: null,
            athleteId: null,
            retired: null,
            retiredDate: null,
            isDefault: null,
            startingDistance: null,
            actualDistance: null,
            crankLengthMillimeters: null,
            wheels: null,
            maxDistance: null,
            type: null        
        },

        urlRoot: function()
        {
            var athleteId = this.get("athleteId") ? this.get("athleteId") : theMarsApp.user.getCurrentAthleteId();

            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/equipment";
        },

        getActualDistance: function()
        {
            var ajaxOptions = {
                url: this.urlRoot() + "/" + this.get("equipmentId") + "/" + this.get("type") + "/actualdistance",
                type: "GET",
                contentType: "application/json"
            };
            
            return Backbone.ajax(ajaxOptions).done(_.bind(this._handleActualDistance, this));

        },

        _handleActualDistance: function(data)
        {
            this.set("actualDistance", data.actualDistance);
        }
    });

    return EquipmentModel;
});
