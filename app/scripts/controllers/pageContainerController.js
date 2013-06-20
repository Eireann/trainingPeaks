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
            this.on("close", this.unbindLibraryAnimate, this);
        },

        bindLibraryAnimate: function()
        {
            if (this.views.library)
            {
                this.views.library.on("animate", this.onLibraryAnimate, this);
            }
        },

        unbindLibraryAnimate: function()
        {
            if (this.views.library)
            {
                this.views.library.off("animate", this.onLibraryAnimate, this);
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
