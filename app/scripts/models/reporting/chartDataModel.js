define(
[
    "moment",
    "underscore",
    "TP"
],
function(moment, _, TP)
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

        },

        setParameters: function(options)
        {
            if (!options)
                return;

            var parameterNames = ["workoutTypeIds", "startDate", "endDate"];

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
            var apiRoot = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting";

            return apiRoot;
        },

        url: function ()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for reporting";

            var start = moment(this.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            var urlExtension = "/" + start + "/" + end;

            return this.urlRoot() + urlExtension;
        },

        parse: function (response)
        {
            return { data: response };
        }
    });
});