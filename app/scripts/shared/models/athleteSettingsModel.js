﻿define(
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
            firstName: null,
            lastName: null,

            age: null,
            birthday: null,
            gender: null,

            athleteType: null,
            userType: null,

            address: null,
            address2: null,
            city: null,
            state: null,
            country: null,
            zipCode: null,

            timeZone: null,
            dateFormat: null,
            units: 1,

            email: null,
            isEmailVerified: null,
            phone: null,
            cellPhone: null,

            profilePhotoUrl: null,

            allowMarketingEmails: null,
            enablePrivateMessageNotifications: null,
            enableVirtualCoachEmails: null,
            virtualCoachEmailHour: null,
            enableWorkoutCommentNotification: null,

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

