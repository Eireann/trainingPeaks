define(
[
    "underscore",
    "TP"
],
function(
    _,
    TP
    )
{
    return TP.Controller.extend(
    {
        views: {},

        initialize: function()
        {
            this.on("show", this.bindLibraryAnimate, this);
        },

        bindLibraryAnimate: function()
        {
            if (this.views.library)
            {
                this.listenTo(this.views.library, "animate", this.onLibraryAnimate, this);
            }
        },

        onLibraryAnimate: function (cssAttributes, duration)
        {
            _.each(this.views, function(view)
            {
                view.trigger("library:animate", cssAttributes, duration);
            });
        }
    });
});
