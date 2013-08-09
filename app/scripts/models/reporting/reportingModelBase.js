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
        useDates: true,

        cacheable: false,

        defaults:
        {
            data: [],
            dateOptions: {
                startDate: moment().subtract('days', 90),
                endDate: moment().add('days', 21)
            }
        },

        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var apiRoot = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + this.reportName;

            return apiRoot;
        },

        url: function ()
        {
            var url = this.urlRoot();

            if(this.useDates)
            {
                url = url + "/" + this.buildDateUrlParams().join("/");
            }

            var extensionParams = this.buildUrlExtensionParams();

            if(extensionParams && extensionParams.length)
            {
                url = url + "/" + extensionParams.join("/");
            }

            return url;
        },

        buildDateUrlParams: function()
        {
            if (!this.has("dateOptions.startDate") || !this.has("dateOptions.endDate"))
            {
                throw "startDate & endDate needed for " + this.reportName;
            }

            var startDate = moment(this.get("dateOptions.startDate")).format(TP.utils.datetime.shortDateFormat);
            var endDate = moment(this.get("dateOptions.endDate")).format(TP.utils.datetime.shortDateFormat);

            return [startDate, endDate];
        },

        buildUrlExtensionParams: function()
        {
            return [];
        },

        parse: function (response)
        {
            return { data: response };
        }
    };
});