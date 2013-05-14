define(
[
],
function()
{
    var options =
    {
        toolbar:
        {
            enabled: false
        },
        controller: null,
        view: null
    };

    var init = function(plot)
    {




    };
    
    if ($.plot)
    {
        $.plot.plugins.push(
        {
            init: init,
            options: options,
            name: "toolbar",
            version: "0.1"
        });
    }
});