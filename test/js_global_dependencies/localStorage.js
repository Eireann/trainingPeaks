// setup a stub for localStorage
define(
[],
function()
{
    return {
        values: {},
        getItem: function(key) { return this.values.hasOwnProperty(key) ? this.values[key] : null },
        setItem: function(key, value) { this.values[key] = value; }
    };
});
