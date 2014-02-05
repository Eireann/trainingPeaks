define(
[
    "moment",
    "TP",
    "shared/models/metricModel"
],
function(
    moment,
    TP,
    MetricModel
)
{

    var MetricsCollection = TP.Collection.extend(
    {

        model: MetricModel,

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
        },

        url: function()
        {
            if(!this.startDate || !this.endDate)
            {
                throw new Error("startDate & endData needed for MetricsCollection");
            }

            var start = moment(this.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            return this.urlRoot() + "/" + start + "/" + end;
        },

        initialize: function(models, options)
        {
            options = options || {};

            this.startDate = options.startDate;
            this.endDate = options.endDate;
        }

    });

    return MetricsCollection;

});
