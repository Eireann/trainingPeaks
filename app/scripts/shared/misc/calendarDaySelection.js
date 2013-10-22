define(
[
    "underscore",
    "TP",
    "shared/misc/selection",
    "shared/utilities/calendarUtility",
    "views/calendar/moveItems/shiftWizzardView"
],
function(
    _,
    TP,
    Selection,
    CalendarUtility,
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
        }

    });

    return CalendarDaySelection;

});
