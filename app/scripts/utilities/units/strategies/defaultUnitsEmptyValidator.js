define(
[
    "underscore"
], function(
    _
) {

    var validator = 
    {
        hasValue: function(value)
        {
            return !(this._valueIsEmpty(value) || this._valueIsNotANumber(value) || !_.isFinite(value));
        },

        _valueIsEmpty: function(value)
        {
            return _.isUndefined(value) || _.isNull(value) || ("" + value).trim() === "" || (Number(value) === 0 && !this._valueIsZero(value));
        },

        _valueIsNotANumber: function(value)
        {
            return _.isNaN(value) || _.isNaN(Number(value)) || _.isUndefined(value) || _.isNull(value);
        },

        _valueIsZero: function(value)
        {
            return value === 0 || value === "0" || /^0+.?0*$/.test(value);
        }
    };

    return function(value, options)
    {
        return validator.hasValue(value);
    }

});