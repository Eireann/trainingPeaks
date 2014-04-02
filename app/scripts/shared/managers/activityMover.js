define(
[
    "jquery",
    "underscore",
    "backbone",
    "moment",
    "TP",
    "shared/models/activityModel",
    "models/workoutModel",
    "shared/models/metricModel"
],
function(
    $,
    _,
    Backbone,
    moment,
    TP,
    ActivityModel,
    WorkoutModel,
    MetricModel
)
{

    function ActivityMover(options)
    {
        if(!options || !options.featureAuthorizer)
        {
            throw new Error("Activity mover requires feature authorizer");
        }

        this.featureAuthorizer = options.featureAuthorizer;
    }

    _.extend(ActivityMover.prototype, Backbone.Events,
    {

        moveActivityToDay: function(activity, date)
        {
            activity = ActivityModel.unwrap(activity);

            if(activity instanceof MetricModel)
            {
                this._moveMetricModelToDay(activity, date);
            }
            else if(activity instanceof WorkoutModel)
            {
                this._moveWorkouModelToDay(activity, date);
            }
        },

        _moveMetricModelToDay: function(metric, date)
        {
            var timeStamp = moment.local(date).format("YYYY-MM-DD") + moment.local(metric.get("timeStamp")).format("THH:mm:ss");

            if(timeStamp === metric.get("timeStamp"))
            {
                return;
            }

            metric.save({ timeStamp: timeStamp }, { wait: true });
        },

        _moveWorkouModelToDay: function(workout, date)
        {
            var workoutDay = moment(date).format(TP.utils.datetime.longDateFormat);

            if(workoutDay === workout.get("workoutDay"))
            {
                return;
            }

            if(this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.EditLockedWorkout, { workout: workout }))
            {
                workout.save({ workoutDay: workoutDay }, { wait: true });
            }
        }

    });

    return ActivityMover;

});
