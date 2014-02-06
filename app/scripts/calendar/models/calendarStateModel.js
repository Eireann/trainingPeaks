define(
[
    "underscore",
    "moment",
    "TP",
    "shared/utilities/calendarUtility"
],
function(
    _,
    moment,
    TP,
    CalendarUtility
)
{

    var CalendarStateModel = TP.Model.extend({

        initialize: function()
        {
            if(!this.get("date"))
            {
                this.setDate(TP.utils.datetime.getTodayDate());
            }
        },

        setDate: function(date, options)
        {
            if(!moment.isMoment(date))
            {
                date = moment.local(date);
            }
            this.set({date: date.format(CalendarUtility.idFormat)}, options);
        }

    });

    return CalendarStateModel;

});
