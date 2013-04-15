define(
[
], function ()
{
    return {

        isThisWeek: function(dateToCheck)
        {
            var today = moment();
            var weekDate = moment(dateToCheck);
            return weekDate.isoWeek() === today.isoWeek() && weekDate.year() === today.year();
        }
    };
});