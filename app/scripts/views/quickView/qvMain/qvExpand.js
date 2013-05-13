define(
[
    "underscore",
    "TP",
    "views/quickView/expandedView/quickViewExpandedView",
    "controllers/expandoController"
],
function (_, TP, ExpandedView, ExpandoController)
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
            var viewsWidth = newWidth - 333;
            var numberOfVisibleViews = 2;
            var viewsHeight = (newHeight - 125) / numberOfVisibleViews;
            var left = (windowWidth - newWidth) / 2;
            var top = (windowHeight - newHeight) / 2;

            var self = this;
            var afterExpanding = function()
            {
                //TODO Use CSS classes instead of manually setting css attributes in here
                self.$(".expandButton").hide();
                self.$(".collapseButton, .expandedViewsButtons").show();
                self.$("#quickViewExpandedContent").show();
            };

            var animateExpansion = function()
            {
                var expandDuration = 300;

                //TODO or better, add a class to the main qv container - .expanded or .collapsed
                self.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: expandDuration });
                self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon").hide();
                self.$(".viewOne, .viewTwo").css({ width: viewsWidth, height: viewsHeight });

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
        }

    };
    return workoutQVExpand;
});