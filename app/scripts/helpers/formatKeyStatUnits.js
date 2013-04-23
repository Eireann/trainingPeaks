define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatKeyStatUnits", TP.utils.workout.keyStat.formatUnits);
    return TP.utils.workout.keyStat.formatUnits;
});