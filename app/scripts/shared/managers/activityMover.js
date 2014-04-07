define(
[
    "jquery",
    "underscore",
    "backbone",
    "moment",
    "TP",
    "shared/models/activityModel",
    "models/workoutModel",
    "shared/models/metricModel",
    "models/library/libraryExercise",
    "models/library/trainingPlan",
    "views/calendar/library/applyTrainingPlanToCalendarConfirmationView"
],
function(
    $,
    _,
    Backbone,
    moment,
    TP,
    ActivityModel,
    WorkoutModel,
    MetricModel,
    LibraryExerciseModel,
    TrainingPlanModel,
    ApplyTrainingPlanToCalendarConfirmationView
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

        if(!options || !options.selectionManager)
        {
            throw new Error("Activity mover requires selectionManager");
        }

        if(!options || !options.user)
        {
            throw new Error("Activity mover requires user");
        }

        this.featureAuthorizer = options.featureAuthorizer;
        this.calendarManager = options.calendarManager;
        this.selectionManager = options.selectionManager;
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
            else if(activity instanceof LibraryExerciseModel)
            {
                this._moveLibraryExerciseToDay(activity, date);
            }
            else if(activity instanceof TrainingPlanModel)
            {
                this._moveTrainingPlanToDay(activity, date);
            }
        },

        pasteActivitiesToDay: function(activities, date)
        {
            _.each(activities, function(activity)
            {
                this.pasteActivityToDay(activity, date);
            }, this);
        },

        pasteActivityToDay: function(activity, date)
        {
            activity = ActivityModel.unwrap(activity);

            if(activity instanceof MetricModel)
            {
                return this._pasteMetricModelToDay(activity, date);
            }
            else if(activity instanceof WorkoutModel)
            {
                return this._pasteWorkoutModelToDay(activity, date);
            }
        },

        dropActivityOnDay: function(activity, date)
        {
            return this.dropActivitiesOnDay([activity], date);
        },

        dropActivitiesOnDay: function(activities, date)
        {
            var containsWorkouts = _.find(activities, function(model) { return ActivityModel.unwrap(model) instanceof WorkoutModel; });

            if(containsWorkouts && !this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.SaveWorkoutToDate, { targetDate: date }))
            {
                this.featureAuthorizer.showUpgradeMessage(this.featureAuthorizer.features.SaveWorkoutToDate.options);
                return false;
            }

            _.each(activities, function(activity)
            {
                this.moveActivityToDay(activity, date);
            }, this);

            return true;
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

        _moveLibraryExerciseToDay: function(libraryExercise, date)
        {
            var createWorkoutFromLibrary = function(){
                var workout = libraryExercise.createWorkout({ date: date });
                this.selectionManager.setSelection(workout);
                this.calendarManager.addItem(workout);
            };

            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.SaveWorkoutToDate, 
                _.bind(createWorkoutFromLibrary, this),
                {targetDate: date}
            );
        },

        _moveTrainingPlanToDay: function(trainingPlan, date)
        {
            new ApplyTrainingPlanToCalendarConfirmationView({model: trainingPlan, targetDate: date}).render();
        },

        _pasteMetricModelToDay: function(metric, date)
        {
            var athleteId = this.user.getCurrentAthleteId();

            if(metric.isNew())
            {
                metric = metric.clone();
                metric.save(
                {
                    timeStamp: moment.local(date).format(TP.utils.datetime.longDateFormat),
                    athleteId: athleteId
                });
                this.calendarManager.addItem(metric);
            }
            // Cut metric for different athlete should be ignored
            else if(metric.get("athleteId") === athleteId)
            {
                this.moveActivityToDay(metric, date);
            }

            return metric;
        },

        _pasteWorkoutModelToDay: function(workout, date)
        {
            var applyPasteWorkout = function()
            {
                var athleteId = this.user.getCurrentAthleteId();
                if(workout.isNew())
                {
                    workout = workout.clone();
                    workout.save(
                    {
                        workoutDay: date,
                        athleteId: athleteId
                    });
                    this.calendarManager.addItem(workout);
                }
                // Cut workout for different athlete should be ignored
                else if(workout.get("athleteId") === athleteId)
                {
                    this.moveActivityToDay(workout, date);
                }
            };

            this.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                this.featureAuthorizer.features.SaveWorkoutToDate, 
                _.bind(applyPasteWorkout, this),
                { targetDate: date }
            );

            return workout;
        }

    });

    return ActivityMover;

});