define(
[
    "TP"
],
function (TP)
{
    return TP.Collection.extend(
    {
        dateFormat: "YYYY-MM-DD",

        initialize: function ()
        {
            _.bindAll(this);
        },

        getDayModel: function (date, startOfWeekDayIndex)
        {
            var weekStartDate = moment(date).day(startOfWeekDayIndex).format(this.dateFormat);
            var week = this.get(weekStartDate);

            if (!week)
                throw "Could not find week for day model";

            var dayModel = week.get("week").get(moment(date).format(this.dateFormat));
            if (!dayModel)
                throw "Could not find day in week";
            return dayModel;
        }
    });
});