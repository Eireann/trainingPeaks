define(
[
    "handlebars",
    "moment"
],
function(Handlebars, moment)
{
    var dayName = function(date, format)
    {
        if (typeof format !== 'string')
        {
            format = "ddd";
        }

        if (typeof date === 'number')
        {
            theMoment = moment().day(date);
        } else
        {
            theMoment = moment(date);
        }

        return theMoment.format(format);

    };

    Handlebars.registerHelper("dayName", dayName);
    return dayName;
});