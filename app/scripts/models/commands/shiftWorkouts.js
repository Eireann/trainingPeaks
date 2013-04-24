﻿define(
[
    "moment",
    "TP"
],
function(moment, TP)
{

    return TP.Model.extend(
    {

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
            return theMarsApp.apiRoot + "/WebApiServer/fitness/v1/athletes/" + athleteId + "/commands/shiftworkouts";
        },

        defaults: function()
        {
            return {
                athleteId: theMarsApp.user.has("userId") ? theMarsApp.user.get("userId") : 0,
                startDate: null,
                endDate: null,
                days: null,
                resultCount: 0
            };
        },

        execute: function()
        {
            return this.save();
        },

        parse: function(response)
        {
            return { resultCount: response };
        }
    });

});