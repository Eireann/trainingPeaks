﻿define(
[
    "TP"
],
function(TP)
{

    return TP.Model.extend(
    {
        url: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/commands/workouts/" + this.get("workoutId") + "/recalc/" + this.get("workoutFileDataId");
        },

        parse: function(response)
        {
            return { workoutModelData: response };
        },

        execute: function()
        {
            return this.save();
        }

    });

});