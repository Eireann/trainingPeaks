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

        setCalendarDay: function(date)
        {
            date = moment(date);
            var timeStamp = moment(this.get("timeStamp")).year(date.year()).month(date.month()).date(date.date());
            this.set("timeStamp", timeStamp.format(TP.utils.datetime.longDateFormat));
        },

        getTimestamp: function()
        {
            return this.get("timeStamp");
        },

        setTimestamp: function(time)
        {
            time = moment(time, "h:mm a");
            var timeStamp = moment(this.get("timeStamp"));
            timeStamp.hour(time.hour()).minute(time.minute()).second(time.second());
            this.set("timeStamp", timeStamp.format(TP.utils.datetime.longDateFormat));
        },

        moveToDay: function(date)
        {
            date = moment(date);
            var attrs =
            {
                timeStamp: moment(this.get("timeStamp")).year(date.year()).month(date.month()).date(date.date()).format(TP.utils.datetime.longDateFormat)
            };

            return this.save(attrs, { wait: true });
        },

        isEmpty: function()
        {
            return _.all(this.get("details"), function(detail)
            {
                return TP.utils.metrics.isBlank(detail.value);
            });
        },

        cloneForCopy: function()
        {
            var clone =  this.clone();
            clone.unset("id");
            return clone;
        },

        pasted: function(options)
        {
            if(options.date)
            {
                var date = options.date;
                if(this.isNew())
                {
                    var metric = this.clone();
                    metric.set("timeStamp", moment(date).format(TP.utils.datetime.longDateFormat));
                    metric.save();
                    theMarsApp.calendarManager.addItem(metric);
                    return metric;
                }
                else
                {
                    this.moveToDay(date);
                    return this;
                }
            }
            else
            {
                console.warn("Can't paste metric on anything but calendar");
                return false;
            }
        },

        dropped: function(options)
        {
            if(options && options.date)
            {
                this.moveToDay(options.date);
            }
        }

    });

    return MetricModel;

});
