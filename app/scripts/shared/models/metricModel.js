define(
[
    "underscore",
    "moment",
    "TP"
],
function(
    _,
    moment,
    TP
)
{

    var MetricModel = TP.APIDeepModel.extend(
    {

        idAttribute: "id",
        webAPIModelName: "Metric",

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
        },

        defaults:
        {
            "id": null,
            "athleteId": null,
            "details": [],
            "timeStamp": null
        },

        getCalendarDay: function()
        {
            var timeStamp = this.get("timeStamp");
            return timeStamp ? moment(timeStamp).format(TP.utils.datetime.shortDateFormat) : "";
        },

        moveToDay: function(date)
        {
            date = moment(date);
            var attrs =
            {
                timeStamp: moment(this.get("timeStamp")).year(date.year()).month(date.month()).date(date.date()).format()
            };

            return this.save(attrs, { wait: true });
        },

        cutToClipboard: function()
        {
            return this;
        },

        copyToClipboard: function()
        {
            var clone =  this.clone();
            clone.unset("id");
            return clone;
        },

        onPaste: function(date)
        {
            if(this.isNew())
            {
                var target = this.clone();
                target.set("timeStamp", moment(date).format());
                target.save();
                return target;
            }
            else
            {
                this.moveToDay(date);
                return this;
            }
        }

    });

    return MetricModel;

});
