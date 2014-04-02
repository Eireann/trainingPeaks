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

        if(!options || !options.calendarManager)
        {
            throw new Error("Activity mover requires calendar manager");
        }

        if(!options || !options.user)
        {
            throw new Error("Activity mover requires user");
        }

        this.featureAuthorizer = options.featureAuthorizer;
        this.calendarManager = options.calendarManager;
        this.user = options.user;
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
                this._moveWorkoutModelToDay(activity, date);
            }
        },

        moveWorkoutToDayOrShowUpgradeMessage: function(workout, date)
        {
            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.SaveWorkoutToDate, 
                _.bind(function(){this._moveWorkoutModelToDay(workout, date);}, this),
                {targetDate: date}
            );
        },

        pasteActivityToDay: function(activity, date)
        {
            activity = ActivityModel.unwrap(activity);

            if(activity instanceof MetricModel)
            {
                this._pasteMetricModelToDay(activity, date);
            }
            else if(activity instanceof WorkoutModel)
            {
                this._pasteWorkoutModelToDay(activity, date);
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

        _moveWorkoutModelToDay: function(workout, date)
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
        },

        _pasteWorkoutModelToDay: function(workout, date)
        {
            var applyPasteWorkout =function()
            {
                var date = date;
                var athleteId = this.user.getCurrentAthleteId();
                if(workout.isNew())
                {
                    var newWorkout = workout.clone();
                    newWorkout.save(
                    {
                        workoutDay: date,
                        athleteId: athleteId
                    });
                    this.calendarManager.addItem(newWorkout);
                }
                // Cut workout for different athlete should be ignored
                else if(workout.get("athleteId") === athleteId)
                {
                    this._moveWorkoutModelToDay(workout, date);
                }
            };

            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.SaveWorkoutToDate, 
                _.bind(applyPasteWorkout, this),
                { targetDate: date }
            );
        }

    });

    return ActivityMover;

});
