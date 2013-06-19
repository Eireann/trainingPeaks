define(
[
    "TP",
    "hbs!templates/views/dashboard/dashboardCharts"
],
function(TP, dashboardTemplate)
{
    var DashboardView =
    {
        template:
        {
            type: "handlebars",
            template: dashboardTemplate
        },

        initialize: function()
        {
            _.bindAll(this, "resizeContainer");
            $(window).on("resize", this.resizeContainer);
            this.on("library:animate", this.onLibraryAnimate, this);
            this.on("render", this.resizeHeight, this);
        },

        onLibraryAnimate: function(libraryAnimationCssAttributes, duration)
        {
            var libraryWidth = libraryAnimationCssAttributes.width;
            var wrapperWidth = this.$el.closest("#dashboardWrapper").width();
            var dashboardWidth = wrapperWidth - libraryWidth;
            var dashboardContainer = this.$el.closest("#dashboardContainer");
            var cssAttributes = { width: dashboardWidth };

            dashboardContainer.animate(cssAttributes, { duration: duration });
        },

        resizeHeight: function()
        {
            var $window = $(window);
            var headerHeight = $("#navigation").height();
            var windowHeight = $window.height();
            var chartsContainerHeight = windowHeight - headerHeight - 75;
            if (this.$el.closest("#dashboardContainer").width() < 1007)
            {
                chartsContainerHeight -= 28;
            }
            this.$(".scrollable").css({ height: chartsContainerHeight + 'px' });
            
        },

        resizeContainer: function(event)
        {
            this.resizeHeight();

            // make sure we still fit in window
            var $window = $(window);
            var wrapper = this.$el.closest("#dashboardWrapper");
            var library = wrapper.find("#libraryContainer");
            var dashboardContainer = this.$el.closest("#dashboardContainer");
            var parentWidth = wrapper.width() < $window.width() ? wrapper.width() : $window.width();

            // account for library padding
            var padding = library.outerWidth() - library.width();
            var dashboardWidth = parentWidth - library.outerWidth() - padding;
            dashboardContainer.width(dashboardWidth);
        }

    };

    return TP.ItemView.extend(DashboardView);
});