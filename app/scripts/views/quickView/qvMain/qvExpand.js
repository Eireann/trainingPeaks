define(
[
    "underscore",
    "TP",
    "views/quickView/expandedView/quickViewExpandedView"
],
function (_, TP, ExpandedView)
{
    var workoutQVExpand =
    {
        initializeExpand: function()
        {
            _.extend(this.events, this.expandEvents);
            this.on("close", this.closeExpandedView, this);
        },

        closeExpandedView: function()
        {
            if(this.expandedView)
            {
                this.expandedView.close();
            }
        },

        expandEvents:
        {
            "click #quickViewExpandDiv": "expandClicked",
            "click #quickViewCollapseDiv": "collapseClicked"
        },


        renderExpandedView: function()
        {
            if(!this.expandedView)
            {
                this.expandedView = new ExpandedView({ model: this.model });
                this.expandedView.render();
                this.ui.quickViewContentExpanded.append(this.expandedView.$el);
            }
        },

        expandClicked: function ()
        {
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
                //TODO: Collide & Expand button should be the same, the text() should change
                // Maybe we shouldn't check the text from in here due to i18n issues?
                // also having two separate buttons makes it easy to know which state we're in
                self.$(".expandButton").hide();
                self.$(".collapseButton, .expandedViewsButtons").show();
                self.$("#quickViewExpandedContent").show();
            };

            var animateExpansion = function()
            {
                var expandDuration = 300;

                //TODO Use jQuery hide() and show()
                // or better, add a class to the main qv container - .expanded or .collapsed
                self.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: expandDuration });
                self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon").css({ display: "none" });
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
            this.animateOneStepCollapse();
        },

        animateOneStepCollapse: function()
        {
            var self = this;

            var afterCollapsing = function()
            {
                //TODO Collapse & Expand button need to be the same
                //TODO Separation of concerns: quickViewContent needs to show/hide itself through BB View.
                self.$("#menuIcon").css({ display: "" });
                self.$("#workOutQuickView").css({ height: self.originalPosition.height, width: self.originalPosition.width });
                self.$(".collapseButton, .expandedViewsButtons").css({ display: "none" });
                self.$(".tabNavigation, .quickviewFooter, .expandButton").css({ display: "block" });
                self.$("#quickViewContent").css({ display: "block" });
            };

            var collapseDuration = 300;
            this.expandedView.collapse();
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