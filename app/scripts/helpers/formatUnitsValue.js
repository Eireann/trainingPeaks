define(
[
    "underscore",
    "handlebars",
    "TP"
],
function(
         _,
         Handlebars,
         TP
         )
{
    // context here is usually the handlebars context 'this', but could be any options object
    var formatUnitsValueHelper = function (units, value, context, defaultValue)
    {

        // easy way to pass in a default value
        var options = context;
        if (typeof defaultValue !== "undefined")
        {
            options = _.clone(context);
            options.defaultValue = defaultValue;
        }

        return TP.utils.conversion.formatUnitsValue(units, value, options);
    };

    Handlebars.registerHelper("formatUnitsValue", formatUnitsValueHelper);
    return formatUnitsValueHelper;
});