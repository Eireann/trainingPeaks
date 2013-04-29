define(
[
    "underscore",
    "TP",
    "views/quickView/expandedView/quickViewExpandedView"
],
function (
    _,
    TP,
    ExpandedView

)
{
    var workoutQVExpand = {

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

            this.animate(windowHeight, windowWidth);
            
        },

        animate: function(windowHeight, windowWidth)
        {
            var duration = 300;
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
                self.$(".expandButton").css({ display: "none" });
                self.$(".collapseButton, .expandedViewsButtons").css({ display: "block" });
                self.$("#quickViewExpandedContent").css({ display: "block" });
            };

            var animateExpansion = function()
            {
                var expandDelay = 300;
                var expandDuration = 300;
                setTimeout(function()
                {
                    self.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: expandDuration });
                    self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon").css({ display: "none" });
                    self.$(".viewOne, .viewTwo").css({ width: viewsWidth, height: viewsHeight });

                    self.$el.animate({ height: newHeight, width: newWidth },
                    {
                        duration: expandDuration, complete: afterExpanding
                    });
                }, expandDelay);
            };

            var moveThenExpand = function()
            {
                var moveDuration = 100;
                self.$el.animate({ top: top + "px", left: left + "px" },
                    {
                        duration: moveDuration, complete: animateExpansion
                    });
            };

            moveThenExpand();

        },

        collapseClicked: function ()
        {
            var duration = 300;

            var self = this;

            var afterCollapsing = function()
            {
                self.$("#menuIcon").css({ display: "" });
                self.$("#workOutQuickView").css({ height: self.originalPosition.height, width: self.originalPosition.width });
                self.$(".collapseButton, .expandedViewsButtons").css({ display: "none" });
                self.$(".tabNavigation, .quickviewFooter, .expandButton").css({ display: "block" });
                self.$("#quickViewContent").css({ display: "block" });
                animateMove();
            };

            var animateMove = function()
            {
                var moveDelay = 300;
                var moveDuration = 300;
                setTimeout(function()
                {
                     self.$el.animate({
                        height: self.originalPosition.height,
                        width: self.originalPosition.width,
                        top: self.originalPosition.top + "px",
                        left: self.originalPosition.left + "px"
                    },
                    {
                        duration: moveDuration
                    });                   
                }, moveDelay);
            };

            var collapseThenMove = function()
            {
                var collapseDuration = 300;
                self.$("#quickViewExpandedContent").css({ display: "none" });
                self.$el.animate({
                    height: self.originalPosition.height,
                    width: self.originalPosition.width
                },
                {
                    duration: collapseDuration,
                    complete: afterCollapsing
                });                   
            };

            collapseThenMove();

        },

        afterCollapse: function()
        {

        }

    };
    return workoutQVExpand;
});