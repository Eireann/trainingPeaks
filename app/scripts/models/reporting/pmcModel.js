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
            if (options)
            {
                this.startDate = options.startDate;
                this.endDate = options.endDate;
            }

            this.workoutTypes = 0;
            this.ctlConstant = 42;
            this.ctlStart = 40;
            this.atlConstant = 7;
            this.atlStart = 40;
        },

        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
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