define(
[
], function ()
{
    return {

        // note - if we change user settings to allow sunday week start, we'll have to change this method to detect user settings ...
        isThisWeek: function(dateToCheck)
        {
            var today = moment();
            var weekDate = moment(dateToCheck);
            return weekDate.isoWeek() === today.isoWeek() && weekDate.year() === today.year();
        }
    };
});