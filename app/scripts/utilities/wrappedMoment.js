define(
[
    "underscore",
    "realMoment"
], function(
    _,
    realMoment)
{
    realMoment.lang(realMoment.lang(), { week: { dow: 1 } });

    // By default all of our dates are treated as UTC, same as calling moment.utc()
    var wrappedMoment = function (input, format, lang, strict)
    {
        return realMoment.utc(input, format, lang, strict);
    };

    // To construct a local date, call moment.local()
    wrappedMoment.local = realMoment;

    // Preserve the other moment static methods
    _(realMoment).functions().each(function (functionName)
    {
        wrappedMoment[functionName] = realMoment[functionName];
    });

    return wrappedMoment;
});
