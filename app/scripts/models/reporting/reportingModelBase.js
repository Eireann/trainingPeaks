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

        parameterNames: [
            "startDate",
            "endDate"
        ],

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
            return;
        },

        setParameters: function(options)
        {
            if (!options)
                return;

            _.each(this.parameterNames, function(name)
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
            var apiRoot = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + this.reportName;

            return apiRoot;
        },

        url: function ()
        {
            return this.urlRoot() + this.buildUrlParameters();
        },

        buildUrlParameters: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for " + this.reportName;

            var start = moment(this.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            var urlExtension = "/" + start + "/" + end;

            return urlExtension;
        },

        parse: function (response)
        {
            return { data: response };
        }
    };
});