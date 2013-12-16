define(
[
    "TP",
    "models/equipmentModel"
],
function(TP, EquipmentModel)
{
    return TP.Collection.extend(
    {
        model: EquipmentModel,

        cacheable: true,

        initialize: function(models, options)
        {
            if (options && options.athleteId)
            {
                this.athleteId = options.athleteId;
            }
            else
            {
                this.athleteId = theMarsApp.user.getCurrentAthleteId();
            }
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + this.athleteId + "/equipment";
        }

    });
});