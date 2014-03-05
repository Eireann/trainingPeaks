define(
[
    "underscore",
    "TP",
    "./userModel",
    "models/equipmentCollection"
],
function(_, TP, UserModel, EquipmentCollection)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "AthleteSettings",
        idAttribute: "athleteId",

        defaults: function()
        {
            return _.extend({}, UserModel.prototype.personDefaultFields, {
                athleteId: 0,
                enableVirtualCoachEmails: null,
                enableWorkoutCommentNotification: null,
                virtualCoachEmailHour: null,
                heartRateZones: null, 
                powerZones: null,
                speedZones: null,
                thresholdsAutoApply: false,
                thresholdsNotifyAthlete: false,
                thresholdsNotifyCoach: false,

                iCalendarKeys: {
                    metricsOnly: null,
                    workoutsAndMetrics: null,
                    workoutOnly: null
                }
            });
        },

        url: function()
        {
            var athleteSettingsUrl = "fitness/v1/athletes/" + this.get("athleteId") + "/settings";
            return theMarsApp.apiRoot + "/" + athleteSettingsUrl;
        },

        getEquipment: function()
        {
            if (!this.equipmentCollection)
            {
                this.equipmentCollection = new EquipmentCollection(null, { athleteId: this.get("athleteId") });
            }

            return this.equipmentCollection;
        }

    });
});

