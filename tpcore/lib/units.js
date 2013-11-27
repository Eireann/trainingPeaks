(function()
{

    var units =
    {
        // Distance
        "m":    { base: "m", factor: 1 },
        "mi":   { base: "m", factor: 1609.34 },
        "km":   { base: "m", factor: 1000 },

        // Time
        "s":    { base: "s", factor: 1, format: _formatSeconds, label: "" },
        "min":  { base: "s", factor: 60 },
        "h":    { base: "s", factor: 60 * 60 },
    };

    function convert(from, to, value, options)
    {
        from = typeof from === "string" ? units[from] : from;
        to = typeof to === "string" ? units[to] : to || units[from.base];

        if(!from || !to || from.base !== to.base)
        {
            throw Error("Invalid conversion");
        }

        return (value * from.factor) / to.factor;
    }

    function sigfig(sigfigs, value)
    {
        var digits = Math.max(0, Math.ceil(Math.log(Math.abs(value)) / Math.LN10));
        var scale = Math.pow(10, sigfigs - digits);
        return Math.round(value * scale) / scale;
    }

    function round(maxdigits, value)
    {
        var digits = Math.max(1, Math.ceil(Math.log(Math.abs(value)) / Math.LN10));
        var decimals = Math.max(maxdigits, digits);
        return sigfig(decimals, value);
    }

    function format(from, to, value, options)
    {
        from_ = typeof from === "string" ? units[from] : from;
        to_ = typeof to === "string" ? units[to] : (to || units[from_.base]);

        value = convert(from_, to_, value, options);
        
        var str = to_.format ? to_.format(value, options) : round(3, value).toString();

        var label = "label" in to_ ? to_.label : to;
        if(label) str += " " + label;

        return str;
    }

    function _formatSeconds(value, options)
    {
        var hours = Math.floor(value / 3600);
        var minutes = Math.floor(value / 60) % 60;
        var seconds = Math.floor(value) % 60;

        function pad(n)
        {
            var str = n.toString();
            return str.length < 2 ? "0" + str : str;
        }

        var str = hours.toString() + ":" + pad(minutes);
        if(options && options.seconds) { str += ":" + pad(seconds); }

        return str;
    }

    // Exports
    TP.utils.convert = convert;
    TP.utils.format = format;

})();
