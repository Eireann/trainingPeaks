define(
[
    "underscore",
    "../defaultUnitsConverter"
], function(
    _,
    defaultUnitsConverter
) {

    /*
        options:
            workoutTypeId, 
            userUnits,
            units
    */
    return _.defaults({

        convertToModelUnits: function(value, options)
        {
            if(this._lookupUserUnitName(options) === "degreesFahrenheit")
            {
                return (5 / 9) * (value - 32);
            }
            else
            {
                return value;
            }
        },

        convertToViewUnits: function(value, options)
        {
            if(this._lookupUserUnitName(options) === "degreesFahrenheit")
            {
                return  ((9 / 5) * value) + 32;
            }
            else
            {
                return value;
            }
        }

    }, defaultUnitsConverter);

});