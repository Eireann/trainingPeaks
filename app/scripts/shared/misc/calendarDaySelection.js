define(
[
    "underscore",
    "TP",
    "shared/misc/selection",
    "shared/utilities/calendarUtility",
    "shared/models/selectedActivitiesCollection",
    "views/calendar/moveItems/shiftWizzardView"
],
function(
    _,
    TP,
    Selection,
    CalendarUtility,
    SelectedActivitiesCollection,
    ShiftWizzardView
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
            var clipboard = this.clone();
            clipboard.isCut = true;
            return clipboard;
        },

        copyAction: function()
        {
            var activites = this.map(function(day) { return day.cloneForCopy(); });
            var clipboard = new CalendarDaySelection(activites);
            return clipboard;
        },

        pasteAction: function(options)
        {
            var target = options && options.target;


            if(target instanceof CalendarDaySelection)
            {
                var sourceMoment = moment(this.first().id);
                var targetMoment = moment(target.first().id);
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
        }

    });

    return CalendarDaySelection;

});
