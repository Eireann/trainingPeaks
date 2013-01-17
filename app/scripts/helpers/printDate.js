define(
[
    "handlebars",
    "moment"
],
function(Handlebars, moment)
{
    var printDate = function(dateAsLongEpoch)
    {
        return moment(dateAsLongEpoch).format("L");
    };

    Handlebars.registerHelper("printDate", printDate);
    return printDate;
});