define(
[
    "underscore",
    "moment",
    "TP",
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
            var first = this.first().id;
            var last = this.last().id;

            var shiftWizzardView = new ShiftWizzardView(
            {
                selectionStartDate: first,
                selectionEndDate: last
            });
            shiftWizzardView.render(); 
        },

        deleteAction: function()
        {
            this._getActivitesCollection().deleteSelectedItems();
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

                this.each(function(day)
                {
                    var date = moment(day.id).add(delta, "days").format(CalendarUtility.idFormat);
                    day.pasted({ date: date });
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
            var activites = this.map(function(day) { return day.itemsCollection.models; });
            activites = _.flatten(activites, true);

            return new SelectedActivitiesCollection(activites);
        },

        _firstMoment: function()
        {
            var moments = this.map(function(day) { return moment(day.id); });
            return _.min(moments);
        }

    });

    CalendarDayModel.prototype.selectionClass = CalendarDaySelection;

    return CalendarDaySelection;

});
