define(
[
    "underscore"
],
function(_)
{
    var Clipboard = function ()
    {
        this.empty();
    };

    Clipboard.prototype = 
    {
        set: function (value, action)
        {
            var validActions = ['cut', 'copy'];

            if (!value)
                throw "Invalid clipboard paste - value is required";

            if (!action)
                throw "Invalid clipboard paste - action is required";

            if (!_.contains(validActions, action))
                throw "Invalid clipboard action (" + action + "), valid actions are: " + validActions.join(',');

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
            this.data = { value: null, action: null };
        }
    };

    return Clipboard;
});