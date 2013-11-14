define(
[
    "jquery",
    "underscore",
    "setImmediate",
    "TP",
    "hbs!templates/views/home/scrollableColumn"
],
function(
    $,
    _,
    setImmediate,
    TP,
    scrollableColumnTemplate
    )
{

    var scrollableContainerLayout = { 

        className: "scrollableColumnContainer",

        regions: {
            contentRegion: ".contents"
        },

        initialize: function(options)
        {
            this.initResizeEvents();
        },

        template: {
            type: "handlebars",
            template: scrollableColumnTemplate
        },

        initResizeEvents: function()
        {
            _.bindAll(this, "resizeContainer");
            $(window).on("resize.scrollableColumnContainer", this.resizeContainer);
            this.on("render", this.resizeContainerAfterRender, this);
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
        },

        resizeContainerHeight: function()
        {
            var $window = $(window);
            var headerHeight = this.$el.offset().top;
            var windowHeight = $window.height();
            var primaryContentContainerHeight = windowHeight - headerHeight - 40;

            this.$(".scrollable").css({ height: primaryContentContainerHeight + 'px' });
        }
    };

    return TP.Layout.extend(scrollableContainerLayout);
});
