define(
[
    "underscore",
    "TP"
],
function (
    _,
    TP
)
{
    var EquipmentModel = TP.APIBaseModel.extend(
    {
        webAPIModelName: "EquipmentBase",
        idAttribute: "equipmentId",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/equipment";
        },

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
        }
    });

    return EquipmentModel;
});
