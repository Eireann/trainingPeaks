define(
[
    "TP",
    "models/equipmentCollection"
],
function(TP, EquipmentCollection)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "AthleteSettings",
        idAttribute: "athleteId",

        defaults:
        {
            athleteId: 0,
            userName: null,
            birthday: null,
            gender: null,
            email: null,
            address: null,
            address2: null,
            city: null,
            state: null,
            country: null,
            zipCode: null,
            phone: null,
            cellPhone: null,
            profilePhotoUrl: null,
            age: null,
            units: 0,
            dateFormat: null,
            timeZone: null,
            heartRateZones: null,
            powerZones: null,
            speedZones: null,
            iCalendarKeys: {
                workoutsAndMetrics: null,
                workoutOnly: null,
                metricsOnly: null
            },
            enableWorkoutCommentNotification: null,
            enableVirtualCoachEmails: null,
            virtualCoachEmailHour: null,
            thresholdsAutoApply: false,
            thresholdsNotifyAthlete: false,
            thresholdsNotifyCoach: false
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