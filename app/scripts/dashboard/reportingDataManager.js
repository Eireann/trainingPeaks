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

        fetchReport: function(reportName, startDate, endDate, options)
        {

            if (!startDate || !endDate)
            {
                throw new Error("startDate & endDate needed for ReportFetcher");
            }

            var athleteId = theMarsApp.user.getCurrentAthleteId();
            var url = theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/reporting/" + reportName;
            url += "/" +  moment(startDate).format(TP.utils.datetime.shortDateFormat);
            url += "/" +  moment(endDate).format(TP.utils.datetime.shortDateFormat);

            if(options)
            {
                return Backbone.ajax({
                    url: url,
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(options)
                });
            }
            else
            {
                return Backbone.ajax({ url: url, type: "GET" });
            }
        }


    });

    return ReportingDataManager;

});