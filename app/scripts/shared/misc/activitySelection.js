define(
[
    "underscore",
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
            this._getActivitesCollection().deleteSelectedItems();
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

                this.each(function(activity)
                {
                    activity.pasted({ date: date });
                });

                if(this.isCut)
                {
                    theMarsApp.selectionManager.clearClipboard();
                }
            }
            else
            {
                console.warn("Days can only be pasted to other days");
                return false;
            }
        },

        _getActivitesCollection: function()
        {
            var activites = this.models.map(_.bind(ActivityModel.wrap, ActivityModel));
            return new SelectedActivitiesCollection(activites);
        }

    });

    WorkoutModel.prototype.selectionClass = ActivitySelection;
    MetricModel.prototype.selectionClass = ActivitySelection;

    return ActivitySelection;

});

