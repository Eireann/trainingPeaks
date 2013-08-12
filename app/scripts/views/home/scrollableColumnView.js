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
    var scrollableContainerView = {

        initialize: function(options)
        {
            this.initResizeEvents();
            this.wrapInScrollableTemplate(options.template);

            if(!this.collection)
                this.collection = new TP.Collection();

            if(!this.itemView)
                this.itemView = TP.ItemView;
        },

        wrapInScrollableTemplate: function(innerTemplate)
        {

            var wrappedTemplate = function(context)
            {
                var innerHtml = innerTemplate(context);
                var $outerHtml = $(scrollableColumnTemplate());
                $outerHtml.find(".contents").html(innerHtml);
                return $outerHtml;
            };

            this.template = {
                type: "handlebars",
                template: wrappedTemplate
            };

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
            var primaryContentContainerHeight = windowHeight - headerHeight - 40;

            this.$(".scrollable").css({ height: primaryContentContainerHeight + 'px' });
            
        }
    };

    return TP.ItemView.extend(scrollableContainerView);
});