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
            this.initResizeEvents();
            this.initLibraryEvents();
        },

        initResizeEvents: function()
        {
            _.bindAll(this, "resizeContainer");
            $(window).on("resize", this.resizeContainer);
            this.on("render", this.resizeContainerAfterRender, this);
        },

        initLibraryEvents: function()
        {
            _.bindAll(this, "onLibraryAnimateProgress", "onLibraryAnimateComplete");
            this.on("library:animate", this.onLibraryAnimate, this);
        },

        resizeContainerAfterRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.resizeContainer();
            });
        },

        resizeContainer: function()
        {
            this.resizeContainerHeight();
            this.resizeContainerWidth();
        },

        resizeContainerHeight: function()
        {
            var $window = $(window);
            var headerHeight = $("#navigation").height();
            var windowHeight = $window.height();
            var primaryContentContainerHeight = windowHeight - headerHeight - 75;

            // if we have a horizontal scrollbar, adjust for height
            if (this.$el.closest(".frameworkScrollableContainer").width() <= 1007)
            {
                primaryContentContainerHeight -= 28;
            }

            //primaryContentContainerHeight = 200;
            // set min/max height also in case packery or something else tries to override the height
            this.$(".scrollable").css({ height: primaryContentContainerHeight + 'px',
                                      "min-height": primaryContentContainerHeight + 'px',
                                      "max-height": primaryContentContainerHeight + 'px' });
            
        },

        resizeContainerWidth: function()
        {
            // make sure we still fit in window
            var $window = $(window);
            var wrapper = this.$el.closest(".frameworkMainWrapper");
            var library = wrapper.find(".frameworkLibraryContainer");
            var primaryContentContainer = this.$el.closest(".frameworkScrollableContainer");
            var parentWidth = wrapper.width() < $window.width() ? wrapper.width() : $window.width();

            // account for library padding
            var padding = library.outerWidth() - library.width();
            var primaryContentWidth = parentWidth - library.outerWidth() - padding;
            primaryContentContainer.width(primaryContentWidth);
        },

        onLibraryAnimate: function(libraryAnimationCssAttributes, duration)
        {
            var libraryWidth = libraryAnimationCssAttributes.width;
            var wrapperWidth = this.$el.closest(".frameworkMainWrapper").width();
            var primaryContentWidth = wrapperWidth - libraryWidth;
            var primaryContentContainer = this.$el.closest(".frameworkScrollableContainer");
            var cssAttributes = { width: primaryContentWidth };

            var self = this;
            var onComplete = function()
            {
                setImmediate(function()
                {
                    self.onLibraryAnimateComplete();
                });
            };

            this.onLibraryAnimateSetup();
            primaryContentContainer.animate(cssAttributes, { progress: this.onLibraryAnimateProgress, duration: duration, complete: onComplete });
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
            this.resizeContainer();
        }

    });
});
