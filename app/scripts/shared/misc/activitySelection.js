define(
[
    "underscore",
    "moment",
    "TP",
    "shared/models/activityModel",
    "shared/models/metricModel",
    "models/workoutModel",
    "shared/misc/selection",
    "shared/misc/calendarDaySelection",
    "shared/utilities/calendarUtility",
    "shared/models/selectedActivitiesCollection"
],
function(
    _,
    moment,
    TP,
    ActivityModel,
    MetricModel,
    WorkoutModel,
    Selection,
    CalendarDaySelection,
    CalendarUtility,
    SelectedActivitiesCollection
)
{

    var ActivitySelection = Selection.extend(
    {

        deleteAction: function()
        {
            this._getActivitesCollection(_.bind(this._excludeLockedWorkouts, this)).deleteSelectedItems();
        },

        cutAction: function()
        {
            var clipboard = this.clone();
            clipboard.isCut = true;
            return clipboard;
        },

        copyAction: function()
        {
            var activites = this.map(function(activity) { return activity.cloneForCopy(); });
            var clipboard = new ActivitySelection(activites);
            return clipboard;
        },

        pasteAction: function(options)
        {
            var target = options && options.target;

            if(target instanceof CalendarDaySelection)
            {
                var date = moment(target.first().id).format(CalendarUtility.idFormat);
                this._getActivityMover().pasteActivitiesToDay(this.models, date);
                if(this.isCut)
                {
                    this._getSelectionManager().clearClipboard();
                }
            }
            else
            {
                console.warn("Days can only be pasted to other days");
                return false;
            }
        },

        _getActivitesCollection: function(filterFunction)
        {
            var activites = this.filter(filterFunction).map(_.bind(ActivityModel.wrap, ActivityModel));
            return new SelectedActivitiesCollection(activites);
        },

        _excludeLockedWorkouts: function(activity)
        {
            activity = ActivityModel.unwrap(activity);

            return (!activity instanceof WorkoutModel) || theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.EditLockedWorkout, { workout: activity });
        }

    });

    WorkoutModel.prototype.selectionClass = ActivitySelection;
    MetricModel.prototype.selectionClass = ActivitySelection;

    return ActivitySelection;

});

