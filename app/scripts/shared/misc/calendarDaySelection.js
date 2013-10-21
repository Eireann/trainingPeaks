define(
[
    "underscore",
    "TP",
    "shared/misc/selection",
    "shared/utilities/calendarUtility"
],
function(
    _,
    TP,
    Selection,
    CalendarUtility
)
{

    var CalendarDaySelection = Selection.extend(
    {

        extendTo: function(model)
        {
            var first = this.at(0).id;
            var last = model.id;

            var models = _.map(CalendarUtility.daysForRange(first, last), function(date)
            {
                return theMarsApp.calendarManager.days.get(date);
            });

            this.set(models);

            return true;
        }

    });

    return CalendarDaySelection;

});
