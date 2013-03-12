define(
[
    ""
],
function ()
{
    var Clipboard = function ()
    {
        this.data = { value: null, action: null };
    };

    Clipboard.prototype = 
    {
        set: function (value, action)
        {
            this.data =
            {
                action: action,
                value: value
            };
        },
        getAction: function()
        {
            return this.data.action;
        },
        getValue: function ()
        {
            return this.data.value;
        },
        hasData: function ()
        {
            return this.data.value ? true : false;
        },
        empty: function()
        {
            this.data.action = null;
            this.data.value = null;
        }
    };

    return Clipboard;
});