define(
[
    "handlebars",
    "utilities/defaultValue"
],
function(Handlebars, getDefaultValue)
{
    Handlebars.registerHelper("defaultValue", getDefaultValue);
    return getDefaultValue;
});