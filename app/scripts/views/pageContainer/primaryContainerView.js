define(
[
    "underscore",
    "TP"
],
function(_, TP, navigationViewTemplate)
{

    return TP.ItemView.extend(
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
            this.on("render", this.resizeHeight, this);
        },

        initLibraryEvents: function()
        {
            _.bindAll(this, "onLibraryAnimateProgress", "onLibraryAnimateComplete");
            this.on("library:animate", this.onLibraryAnimate, this);
        },

        resizeHeight: function()
        {
            var $window = $(window);
            var headerHeight = $("#navigation").height();
            var windowHeight = $window.height();
            var primaryContentContainerHeight = windowHeight - headerHeight - 65;

            // if we have a horizontal scrollbar, adjust for height
            if (this.$el.closest(".frameworkScrollableContainer").width() < 1007)
            {
                primaryContentContainerHeight -= 28;
            }
            this.$(".scrollable").css({ height: primaryContentContainerHeight + 'px' });
            
        },

        resizeContainer: function(event)
        {
            this.resizeHeight();

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
            primaryContentContainer.animate(cssAttributes, { progress: this.onLibraryAnimateProgress, duration: duration, complete: this.onLibraryAnimateComplete });
        },

        onLibraryAnimateProgress: function()
        {
            return;
        },

        onLibraryAnimateComplete: function()
        {
            return;
        },

    });
});