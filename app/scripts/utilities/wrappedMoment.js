define(
[
    "underscore",
    "moment"
], function(
    _,
    realMoment
)
{

    // Load moment.js, which defines its AMD module with the "moment" name
    // Alias moment as 'realMoment'
    define("realMoment", function()
    {
        return realMoment;
    });

    // undefine moment so we can redefine it with our wrapped version
    // full requirejs version has an undef function
    if(_.isFunction(requirejs.undef))
    {
        requirejs.undef("moment");
    }
    // almond doesn't have an undef function, so just delete it directly
    else if(_.has(requirejs, "_defined") && _.has(requirejs._defined, "moment"))
    {
        delete requirejs._defined.moment;
    }

    // set our default week start day to monday instead of sunday
    realMoment.lang(realMoment.lang(), { week: { dow: 1 } });

    // By default all of our dates are constructed as utc,
    // But existing moment instances are not modified
    var wrappedMoment = function (input, format, lang, strict)
    {
        if(realMoment.isMoment(input) && !input._isUTC)
        {
            throw new Error("wrappedMoment constructor should not called with local moment instance as input. use moment.local to preserve local dates, or moment.utc to convert");
        }
        return realMoment.utc(input, format, lang, strict);
        //return realMoment.isMoment(input) ? input : realMoment.utc(input, format, lang, strict);
    };

    // Preserve the other moment static methods
    _(realMoment).functions().each(function (functionName)
    {
        wrappedMoment[functionName] = realMoment[functionName];
    });

    // To construct a utc date, or convert a date to utc, moment.utc()
    wrappedMoment.utc = function(input, format, lang, strict)
    {
        return realMoment.utc(input, format, lang, strict);
    };

    // To construct a local date, or convert a date to local, call moment.local()
    wrappedMoment.local = function(input, format, lang, strict)
    {
        return realMoment(input, format, lang, strict).local();
    };

    // redefine moment as our wrapped version    
    define("moment", function()
    {
        return wrappedMoment;
    });

    // remove moment from global scope
    if(window && window.moment)
    {
        delete window.moment;
    }

    return wrappedMoment;
});
