define(
[
    "handlebars"
],
function(Handlebars)
{

    var splitString = function(value, separator, index)
    {
        if (!value)
            return "";

        var parts = value.split(separator);

        if (parts.length > index)
            return parts[index];
        else
            return "";
    };

    Handlebars.registerHelper("splitString", splitString);
    return splitString;
});