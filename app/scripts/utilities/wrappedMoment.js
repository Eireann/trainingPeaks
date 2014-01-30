define(
[
    "underscore",
    "realMoment"
], function(
    _,
    realMoment)
{
    realMoment.lang(realMoment.lang(), { week: { dow: 1 } });

    // by default all of our dates are treated as utc, same as calling moment.utc()
    var wrappedMoment = function (input, format, lang, strict)
    {
        return realMoment.utc(input, format, lang, strict);
    };

    // to construct a local date, call moment.local()
    wrappedMoment.local = realMoment;

    // preserve the other moment static methods
    _(realMoment).functions().each(function (functionName)
    {
        wrappedMoment[functionName] = realMoment[functionName];
    });

    return wrappedMoment;
});