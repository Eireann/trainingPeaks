define(
[
    "underscore",
    "TP",
    "controllers/expandoController"
],
function (_, TP, ExpandoController)
{
    var workoutQVExpand =
    {
        initializeExpand: function()
        {
            _.extend(this.events, this.expandEvents);
            this.on("close", this.closeExpandedView, this);

            //TODO Needs some refactor: should be initialized somewhere else?
            this.expandoRegion = new TP.Region(
            {
                el: "#quickViewExpandedContent"    
            });

        },

        closeExpandedView: function()
        {
            if (this.expandoController)
                this.expandoController.close();

            this.expandoRegion.close();
        },

        expandEvents:
        {
            "click #quickViewExpandDiv": "expandClicked",
            "click #quickViewCollapseDiv": "collapseClicked"
        },

        renderExpandedView: function()
        {
            if(!this.expandoController)
            {
                this.expandoController = new ExpandoController({ model: this.model, prefetchConfig: this.prefetchConfig });
                this.expandoRegion.show(this.expandoController.getLayout());
            }
        },

        expandClicked: function ()
        {
            this.expanded = true;
            this.renderExpandedView();

            var windowHeight = $(window).height();
            var windowWidth = $(window).width();

            this.originalPosition = this.$el.position();
            this.originalPosition.height = this.$el.height();
            this.originalPosition.width = this.$el.width();

            this.animateOneStepExpansion(windowHeight, windowWidth);
        },

        animateOneStepExpansion: function(windowHeight, windowWidth)
        {
            var newHeight = windowHeight * 0.95;
            var newWidth = windowWidth * 0.95;
            var left = (windowWidth - newWidth) / 2;
            var top = (windowHeight - newHeight) / 2;

            var self = this;
            var afterExpanding = function()
            {
                //TODO Use CSS classes instead of manually setting css attributes in here
                self.$(".expandButton").hide();
                self.$(".collapseButton, .expandedViewsButtons").show();
                self.$("#quickViewExpandedContent").show();

                self.centerWindow();
            };

            var animateExpansion = function()
            {
                var expandDuration = 300;

                //TODO or better, add a class to the main qv container - .expanded or .collapsed
                self.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: expandDuration });
                self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon").hide();

                self.$el.animate({top: top + "px", left: left + "px",  height: newHeight, width: newWidth },
                {
                    duration: expandDuration, complete: afterExpanding
                });
            };

            animateExpansion();
        },

        collapseClicked: function ()
        {
            this.expanded = false;
            this.animateOneStepCollapse();
        },

        animateOneStepCollapse: function()
        {
            var self = this;

            var afterCollapsing = function()
            {
                //TODO Separation of concerns: quickViewContent needs to show/hide itself through BB View.
                self.$("#menuIcon").show();
                self.$("#workOutQuickView").css({ height: self.originalPosition.height, width: self.originalPosition.width });
                self.$(".collapseButton, .expandedViewsButtons").css({ display: "none" });
                self.$(".tabNavigation, .quickviewFooter, .expandButton").css({ display: "block" });
                self.$("#quickViewContent").css({ display: "block" });
                self.centerWindow();
            };

            var collapseDuration = 300;
            this.expandoController.collapse();
            this.$el.animate({
                height: this.originalPosition.height,
                width: this.originalPosition.width,
                top: this.originalPosition.top + "px",
                left: this.originalPosition.left + "px"
            },
            {
                duration: collapseDuration,
                complete: afterCollapsing
            });                   
        },

        onWindowResize: function()
        {

            if (this.expanded)
            {
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
                var newHeight = windowHeight * 0.95;
                var newWidth = windowWidth * 0.95;

                this.$("#workOutQuickView").width(newWidth).height(newHeight);
                this.$el.width(newWidth).height(newHeight);
            }

            this.centerWindow();

        },

        centerWindow: function()
        {

            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var overallHeight = this.$el.height();

            this.$el.css("left", Math.round((windowWidth - this.$el.width()) / 2) + "px");
            this.$el.css("top", Math.round((windowHeight - overallHeight) / 2) + "px");

            if (this.expanded)
            {
                var headerHeight = this.$(".QVHeader").outerHeight();
                this.$("#quickViewExpandedContent, #expandoLeftColumn, #expandoRightColumn").css("height", overallHeight - headerHeight + "px");
            }

        }


    };
    return workoutQVExpand;
});