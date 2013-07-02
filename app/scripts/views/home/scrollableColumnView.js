define(
[
    "setImmediate",
    "underscore",
    "TP",
    "hbs!templates/views/home/scrollableColumn"
],
function(
    setImmediate,
    _,
    TP,
    scrollableColumnTemplate
    )
{

    return TP.ItemView.extend(
    {

        initialize: function()
        {
            this.initResizeEvents();
            this.wrapInScrollableTemplate();
        },

        wrapInScrollableTemplate: function()
        {
            var innerTemplate = this.template.template;

            this.template.template = function(context)
            {
                var innerHtml = innerTemplate(context);
                var $outerHtml = $(scrollableColumnTemplate());
                $outerHtml.find(".contents").html(innerHtml);
                return $outerHtml;
            }
        },

        initResizeEvents: function()
        {
            _.bindAll(this, "resizeContainer");
            $(window).on("resize", this.resizeContainer);
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
            var primaryContentContainerHeight = windowHeight - headerHeight - 30;

            this.$(".scrollable").css({ height: primaryContentContainerHeight + 'px' });
            
        }
    });
});