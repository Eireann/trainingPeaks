define(
[
    "moment",
    "underscore",
    "TP"
],
function(moment, _, TP)
{
    return {

        reportName: "unknown",

        parameterNames: [],

        cacheable: false,

        defaults:
        {
            data: []
        },

        initialize: function (attributes, options)
        {
            this.requestParams = {};
            this.setDefaultParameters();
            this.setParameters(options);
        },

        setDefaultParameters: function()
        {
            // on this.requestParams
            return;
        },

        setParameters: function(options)
        {
            if (!options)
                return;

            if(options.dateOptions)
            {
                _.each(["startDate", "endDate"], function(name)
                {
                    this.requestParams[name] = options.dateOptions[name];
                }, this);
            }

            _.each(this.parameterNames, function(name)
            {
                if (options.hasOwnProperty(name))
                {
                    this.requestParams[name] = options[name];
                }
            }, this);

        },

        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var apiRoot = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + this.reportName;

            return apiRoot;
        },

        url: function ()
        {
            return this.urlRoot() + this.buildUrlExtension();
        },

        buildUrlExtension: function()
        {
            if (!(this.requestParams.startDate && this.requestParams.endDate))
                throw "startDate & endDate needed for " + this.reportName;

            var start = moment(this.requestParams.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.requestParams.endDate).format(TP.utils.datetime.shortDateFormat);

            var urlExtension = "/" + start + "/" + end;

            return urlExtension;
        },

        parse: function (response)
        {
            return { data: response };
        }
    };
});