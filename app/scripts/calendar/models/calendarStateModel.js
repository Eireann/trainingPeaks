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
                this.setDate(moment());
            }
        },

        setDate: function(date, options)
        {
            date = moment(date);
            this.set({date: date.format(CalendarUtility.idFormat)}, options);
        }

    });

    return CalendarStateModel;

});
