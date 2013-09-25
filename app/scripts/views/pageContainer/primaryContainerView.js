define(
[
    "setImmediate",
    "underscore",
    "TP"
],
function(
    setImmediate,
    _,
    TP
    )
{

    return TP.Layout.extend(
    {

        initialize: function()
        {
            this.initLibraryEvents();
        },

        initLibraryEvents: function()
        {
            _.bindAll(this, "onLibraryAnimateProgress", "onLibraryAnimateComplete");
            this.on("library:animate", this.onLibraryAnimate, this);
        },


        onLibraryAnimate: function(libraryAnimationCssAttributes, duration)
        {
            var self = this;
            var onComplete = function()
            {
                setImmediate(function()
                {
                    self.onLibraryAnimateComplete();
                });
            };

            this.onLibraryAnimateSetup();
            setInterval(_.bind(this.onLibraryAnimateProgress, this), 20);
            setTimeout(_.bind(this.onLibraryAnimateComplete, this), duration);
        },

        onLibraryAnimateSetup: function()
        {
            return;
        },

        onLibraryAnimateProgress: function()
        {
            return;
        },

        onLibraryAnimateComplete: function()
        {
            return;
        }

    });
});
