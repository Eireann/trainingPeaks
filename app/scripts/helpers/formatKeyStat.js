define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("formatKeyStat", TP.utils.workout.keyStat.formatStats);
    return TP.utils.workout.keyStat.formatStats;
});