define([], function()
{

    var Profiling =
    {

        time: function()
        {
            if (!window.enableTimers || !console || !console.time) return;
            return console.time.apply(console, arguments);
        },

        timeEnd: function()
        {
            if (!window.enableTimers || !console || !console.timeEnd) return;
            return console.timeEnd.apply(console, arguments);
        },

        profile: function()
        {
            if (!window.enableProfiling || !console || !console.profile) return;
            return console.profile.apply(console, arguments);
        },

        profileEnd: function()
        {
            if (!window.enableProfiling || !console || !console.profileEnd) return;
            return console.profileEnd.apply(console, arguments);
        }

    };

    return Profiling;

});
