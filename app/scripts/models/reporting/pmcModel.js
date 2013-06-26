define(
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
            this.setParametersFromOptions(options);
        },

        setDefaultParameters: function()
        {
            this.workoutTypes = [0];
            this.ctlConstant = 42;
            this.ctlStart = 0;
            this.atlConstant = 7;
            this.atlStart = 0;
        },

        setParametersFromOptions: function(options)
        {
            if (!options)
                return;

            var parameterNames = ["workoutTypes", "ctlConstant", "ctlStart", "atlConstant", "atlStart", "startDate", "endDate"];

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

            var start = this.startDate.format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            var urlExtension = "/" + start + "/" + end + "/" + this.workoutTypes + "/" + this.ctlConstant + "/" + this.ctlStart + "/" + this.atlConstant + "/" + this.atlStart;

            return this.urlRoot() + urlExtension;
        },

        parse: function (response)
        {
            return { data: response };
        }
    });
});