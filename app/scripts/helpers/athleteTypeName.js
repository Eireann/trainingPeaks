define(
[
    "handlebars",
    "TP"
],
function(Handlebars, TP)
{
    Handlebars.registerHelper("athleteTypeName", TP.utils.athlete.types.getNameById);
    return TP.utils.athlete.types.getNameById;
});