(function()
{

    var TP = window.TP = {};
    TP.utils = {};

    // Components

    TP.components = {};
    function ensureComponent($el, name, options)
    {
        if(!TP.components[name]) throw Error("Unknown component: " + name);

        var obj = $el.data("tp." + name);

        if(!obj)
        {
            obj = TP.components[name]($el, options);
            $el.data("tp." + name, obj);
        }

        return obj;
    }


    $.fn.tp = function()
    {
        var component = arguments[0];
        var args = [].slice.call(arguments, 1);

        if(_.isString(args[0]))
        {
            var method = args.shift();
        }

        var options = args[0] || {};

        var value;
        this.each(function(i, el)
        {
            var $el = $(el);
            var obj = ensureComponent($el, component, options);

            if(method) value = obj[method].apply(obj, args);
        });

        return value === undefined ? this : value;
    }

    // Ajax

    $.ajaxSetup({ xhrFields: { withCredentials: true } });

    $.ajaxPrefilter(function(options, originalOptions, xhr)
    {
        if(/^.*!API!/.test(options.url))
        {
            var apiRoot = (window.apiConfig && window.apiConfig.apiRoot);
            options.url = options.url.replace(/.*!API!/, apiRoot);
        }
    });

    // Misc

    var sportTypes =
    {
        1: "Swim",
        2: "Bike",
        3: "Run",
        4: "Brick",
        5: "Crosstrain",
        6: "Race",
        7: "Day Off",
        8: "Mountain Bike",
        9: "Strength",
        10: "Custom",
        11: "XC-Ski",
        12: "Rowing",
        13: "Walk",
        100: "Other"
    }

    TP.utils.lookupSportType = function(id)
    {
        return sportTypes[id];
    }

})();
