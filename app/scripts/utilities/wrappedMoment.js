define(
[
    "underscore",
    "realMoment"
], function(
    _,
    realMoment)
{
    realMoment.lang(realMoment.lang(), { week: { dow: 1 } });

    var wrappedMoment = function (input, format, lang, strict)
    {
        return realMoment.utc(input, format, lang, strict);
    };

    _(realMoment).functions().each(function (functionName)
    {
        wrappedMoment[functionName] = realMoment[functionName];
    });

    return wrappedMoment;
});