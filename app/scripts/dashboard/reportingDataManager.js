define(
[
    "underscore",
    "backbone",
    "TP",
    "framework/dataManager" 
], function(
    _,
    Backbone,
    TP,
    DataManager
    )
{

    var ReportingDataManager = DataManager.extend({

        fetchReport: function(reportName, startDate, endDate, postData)
        {

            if (!startDate || !endDate)
            {
                throw new Error("startDate & endDate needed for ReportFetcher");
            }

            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var url = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + reportName;
            url += "/" +  moment(startDate).format(TP.utils.datetime.shortDateFormat);
            url += "/" +  moment(endDate).format(TP.utils.datetime.shortDateFormat);

            if(postData)
            {
                return this.fetchAjax(this._buildUrlSignature(url, postData), {
                    url: url,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(postData)
                });
            }
            else
            {
                return this.fetchAjax(url, { url: url, type: "GET" });
            }
        },

        fetchMetrics: function(startDate, endDate)
        {
            if (!startDate || !endDate)
            {
                throw new Error("startDate & endDate needed for ReportFetcher");
            }

            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var url = theMarsApp.apiRoot + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
            url += "/" +  moment(startDate).format(TP.utils.datetime.shortDateFormat);
            url += "/" +  moment(endDate).format(TP.utils.datetime.shortDateFormat);

            return this.fetchAjax(url, { url: url, type: "GET" });
        },

        _buildUrlSignature: function(url, postData)
        {
            var parts = [];
            _.each(postData, function(value, key)
            {
                parts.push(key + "=" + value);
            });
            parts.sort();
            return url + "/" + parts.join("/");
        }


    });

    return ReportingDataManager;

});
