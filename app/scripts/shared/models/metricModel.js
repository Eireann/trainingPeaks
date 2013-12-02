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
            var timestamp = moment(this.get("timeStamp"));
            var attrs =
            {
                timeStamp: date.format("YYYY-MM-DD")  + timestamp.format("THH:mm:ss")
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
                var athleteId = theMarsApp.user.getCurrentAthleteId();

                if(this.isNew())
                {
                    var metric = this.clone();
                    metric.save(
                    {
                        timeStamp: moment(date).format(TP.utils.datetime.longDateFormat),
                        athleteId: athleteId
                    });
                    theMarsApp.calendarManager.addItem(metric);
                }
                // Cut metric for different athlete should be ignored
                else if(this.get("athleteId") === athleteId)
                {
                    this.moveToDay(date);
                }

            }
            else
            {
                console.warn("Can't paste metric on anything but calendar");
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
