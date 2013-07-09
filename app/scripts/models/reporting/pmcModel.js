﻿define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.Model.extend(
    {
        cacheable: false,

        defaults:
        {
            data: []
        },

        initialize: function (attributes, options)
        {
            this.setDefaultParameters();
            this.setParameters(options);
        },

        setDefaultParameters: function()
        {
            this.workoutTypeIds = [0];
            this.ctlConstant = 42;
            this.ctlStartValue = 0;
            this.atlConstant = 7;
            this.atlStartValue = 0;
            this.startDate = moment().subtract('days', 90);
            this.endDate = moment().add('days', 21);
        },

        setParameters: function(options)
        {
            if (!options)
                return;

            var parameterNames = ["workoutTypeIds", "ctlConstant", "ctlStartValue", "atlConstant", "atlStartValue", "startDate", "endDate"];

            _.each(parameterNames, function(name)
            {
                if (options.hasOwnProperty(name))
                {
                    this[name] = options[name];
                }
            }, this);

        },

        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var apiRoot = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/performancedata";

            return apiRoot;
        },

        url: function ()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for pmc";

            var start = moment(this.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            var urlExtension = "/" + start + "/" + end + "/" + this.workoutTypeIds.join(",") + "/" + this.ctlConstant + "/" + this.ctlStartValue + "/" + this.atlConstant + "/" + this.atlStartValue;

            return this.urlRoot() + urlExtension;
        },

        parse: function (response)
        {
            return { data: response };
        }
    });
});