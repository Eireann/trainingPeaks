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

        formatValue: function(value)
        {

            // if the input is null or empty string, return empty string or other default value
            if(!_.isString(value) || this._isEmptyString(value))
            {
                return this._getDefaultValueForFormat();
            }           

            // converts LF \n or CR \r to CRLF \r\n for proper whitespace display in browser
            return value.replace(/\r\n/g, "\n").replace(/\r/g,"\n").replace(/\n/g, "\r\n");
        },

        
        parseValue: function(value)
        {
            if(!_.isString(value) || this._isEmptyString(value))
            {
                return this._getDefaultValueForParse();
            }

            // converts CRLF \r\n or LF \n to CR \r  because FLEX WANTS \r, not \n, don't ask me why ...
            return value.replace(/\r\n/g, "\r").replace(/\n/g, "\r");
        },

        _isEmptyString: function(value)
        {
            return value.replace(/\s/g,"") === "";
        }

    });


});