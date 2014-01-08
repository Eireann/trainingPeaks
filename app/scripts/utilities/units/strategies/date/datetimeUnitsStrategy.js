

define(
[ 
    "underscore",
    "utilities/datetime/format",
    "../DefaultUnitsStrategy"
], function(
    _,
    DateTimeFormatter,
    DefaultUnitsStrategy
) {

    /*
        Text strategy parse/format converts line endings to be compatible with db/flex
    */
    return DefaultUnitsStrategy.extend({

        formatValue: function(value)
        {
            return new DateTimeFormatter().format(value, this.options.dateFormat);
        },

        parseValue: function(value)
        {
            return new DateTimeFormatter().parse(value, this.options.dateFormat);
        }

    });


});