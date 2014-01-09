define(
[
    "underscore",
    "../DefaultUnitsStrategy"
], function(
    _,
    DefaultUnitsStrategy
) {

    /*
        Text strategy parse/format converts line endings to be compatible with db/flex
    */
    return DefaultUnitsStrategy.extend({

        // converts LF \n or CR \r to CRLF \r\n for proper whitespace display in browser
        formatValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!_.isString(value))
            {
                return this._getDefaultValueForFormat();
            }           

            return value.replace(/\r\n/g, "\n").replace(/\r/g,"\n").replace(/\n/g, "\r\n");
        },

        
        // converts CRLF \r\n or LF \n to CR \r  because FLEX WANTS \r, not \n, don't ask me why ...
        parseValue: function(value)
        {
            if(!_.isString(value))
            {
                return this._getDefaultValueForParse();
            }

            return value.replace(/\r\n/g, "\r").replace(/\n/g, "\r");
        }

    });


});