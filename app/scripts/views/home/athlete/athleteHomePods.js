define(
[
    "underscore",
    "TP",
    "views/home/scrollableColumnLayout"
],
function(
    _,
    TP,
    ScrollableColumnLayout,
    podsTemplate
    )
{
    return ScrollableColumnLayout.extend(
    {

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: podsTemplate });
        }

    });
});