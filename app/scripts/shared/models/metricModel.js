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
            var athleteId = this._getUser().getCurrentAthleteId();
            return this._getApiRoot() + "/metrics/v1/athletes/" + athleteId + "/timedmetrics";
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
            return timeStamp ? moment.local(timeStamp).format(TP.utils.datetime.shortDateFormat) : "";
        },

        setCalendarDay: function(date)
        {
            date = moment.local(date);
            // If the metric entry is dragged to another day on the calendar,
            // this code tries to preserve the original "time" component of the entry,
            // even though it is not quite relevant.
            var timeStamp = moment.local(this.get("timeStamp")).year(date.year()).month(date.month()).date(date.date());
            this.set("timeStamp", timeStamp.format(TP.utils.datetime.longDateFormat));
        },

        getTimestamp: function()
        {
            return this.get("timeStamp");
        },

        setTimestamp: function(time)
        {
            // This updates the "time" component of the metric entry based on the passed in "time",
            // which comes from the time picker in the QV header.
            time = moment.local(time, "h:mm a");
            var timeStamp = moment.local(this.get("timeStamp"));
            timeStamp.hour(time.hour()).minute(time.minute()).second(time.second());
            this.set("timeStamp", timeStamp.format(TP.utils.datetime.longDateFormat));
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
                this._getActivityMover().pasteActivityToDay(this, options.date);
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
                this._getActivityMover().dropActivityOnDay(this, options.date);
            }
        },

        getKeyStatField: function(userSettingsMetricOrder)
        {
            var details = this.get("details");
            var detailsByType = {};
            _.each(details, function(detail)
            {
                detailsByType[detail.type] = detail;
            });

            var keyMetricTypeId = _.find(userSettingsMetricOrder, function(metricTypeId)
            {
                return _.has(detailsByType, metricTypeId);
            });

            return _.isUndefined(keyMetricTypeId) ? null : detailsByType[keyMetricTypeId];
        },

        _getActivityMover: function()
        {
            return this.options && this.options.activityMover ? this.options.activityMover : theMarsApp.activityMover;
        }
    });

    return MetricModel;

});
