define(
[
    "underscore",
    "moment",
    "TP",
    "shared/models/activityModel",
    "models/workoutModel",
    "shared/misc/selection",
    "shared/utilities/calendarUtility",
    "shared/models/selectedActivitiesCollection",
    "views/calendar/moveItems/shiftWizzardView",
    "models/calendar/calendarDay"
],
function(
    _,
    moment,
    TP,
    ActivityModel,
    WorkoutModel,
    Selection,
    CalendarUtility,
    SelectedActivitiesCollection,
    ShiftWizzardView,
    CalendarDayModel
)
{

    var CalendarDaySelection = Selection.extend(
    {

        extendTo: function(model, event)
        {
            var first = this.at(0).id;
            var last = model.id;

            var models = _.map(CalendarUtility.daysForRange(first, last), function(date)
            {
                return theMarsApp.calendarManager.days.get(date);
            });

            this.set(models);

            return true;
        },

        shiftAction: function()
        {
            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ShiftWorkouts,
                _.bind(this._applyShiftAction, this)
            );
        },

        _applyShiftAction: function()
        {
            var first = this.min(function(m) { return moment(m.id); }).id;
            var last = this.max(function(m) { return moment(m.id); }).id;

            var shiftWizzardView = new ShiftWizzardView(
            {
                selectionStartDate: first,
                selectionEndDate: last
            });
            shiftWizzardView.render();
        },

        deleteAction: function()
        {
            this._getActivitesCollection(_.bind(this._excludeLockedWorkouts, this)).deleteSelectedItems();
        },

        cutAction: function()
        {
            var days = this.map(function(day) { return day.cloneForCut(); });
            var clipboard = new CalendarDaySelection(days);
            clipboard.isCut = true;
            return clipboard;
        },

        copyAction: function()
        {
            var days = this.map(function(day) { return day.cloneForCopy(); });
            var clipboard = new CalendarDaySelection(days);
            return clipboard;
        },

        pasteAction: function(options)
        {
            var target = options && options.target;


            if(target instanceof CalendarDaySelection)
            {
                var sourceMoment = this._firstMoment();
                var targetMoment =target._firstMoment();
                var delta = targetMoment.diff(sourceMoment, "days");

                var activityMover = this._getActivityMover();
                this.each(function(day)
                {
                    var date = moment(day.id).add(delta, "days").format(CalendarUtility.idFormat);
                    activityMover.pasteActivitiesToDay(day.items(), date);
                });

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
            var activites = this.map(function(day) { return day.itemsCollection.filter(filterFunction); });
            activites = _.flatten(activites, true);

            return new SelectedActivitiesCollection(activites);
        },

        _firstMoment: function()
        {
            var moments = this.map(function(day) { return moment(day.id); });
            return _.min(moments);
        },

        _excludeLockedWorkouts: function(activity)
        {
            activity = ActivityModel.unwrap(activity);

            return (!activity instanceof WorkoutModel) || theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.EditLockedWorkout, { workout: activity });
        }


    });

    CalendarDayModel.prototype.selectionClass = CalendarDaySelection;

    return CalendarDaySelection;

});
