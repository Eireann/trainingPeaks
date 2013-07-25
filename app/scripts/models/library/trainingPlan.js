﻿define(
[
    "TP",
    "./trainingPlanDetails"
],
function (TP, TrainingPlanDetailsModel)
{
    var TrainingPlanModel = TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "TrainingPlan",
        idAttribute: "planId",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/plans/v1/athletes/" + athleteId + "/plans";
        },

        defaults:
        {
            "planId": null,
            "title": null,
            "planStatus": null
        },

        initialize: function()
        {
            this.details = new TrainingPlanDetailsModel({ planId: this.get("planId") });
        }

    });

    return TrainingPlanModel;
});