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
        },

        expandEvents:
        {
            "click #quickViewExpandDiv": "expandClicked",
            "click #quickViewCollapseDiv": "collapseClicked"
        },


        expandClicked: function ()
        {
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();
            var expandedView = new ExpandedView({ model: this.model });

            expandedView.render();
            this.ui.quickViewContentExpanded.append(expandedView.$el);

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
                self.$("#workOutQuickView").css({ height: newHeight, width: newWidth });
                self.afterExpand();
            };

            var animateExpansion = function()
            {
                setTimeout(function()
                {
                    self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon").css({ display: "none" });
                    self.$(".viewOne, .viewTwo").css({ width: viewsWidth, height: viewsHeight });
                    self.$(".expandButton").css({ display: "none" });
                    self.$(".collapseButton, .expandedViewsButtons").css({ display: "block" });

                    self.$el.animate({ height: newHeight, width: newWidth },
                    {
                        duration: 200, complete: afterExpanding
                    });
                }, 300);
            };

            var moveThenExpand = function()
            {
                self.$el.animate({ top: top + "px", left: left + "px" },
                    {
                        duration: 100, complete: animateExpansion
                    });
            };

            moveThenExpand();

        },

        afterExpand: function()
        {
            this.$("#quickViewExpandedContent").css({ display: "block" });
        },

        collapseClicked: function ()
        {
            var duration = 300;

            var self = this;
            this.$el.animate({
                height: this.originalPosition.height,
                width: this.originalPosition.width,
                top: this.originalPosition.top + "px",
                left: this.originalPosition.left + "px"
            },
            {
                duration: duration,
                complete: function()
                {
                    self.afterCollapse();
                }
            });
            //this.$("#workOutQuickView").animate({ height: this.originalPosition.height, width: this.originalPosition.width }, { duration: duration });
            this.$("#menuIcon").css({ display: "" });
            this.$("#quickViewExpandedContent").css({ display: "none" });
        },

        afterCollapse: function()
        {
            this.$("#workOutQuickView").css({ height: this.originalPosition.height, width: this.originalPosition.width });
            this.$(".collapseButton, .expandedViewsButtons").css({ display: "none" });
            this.$(".tabNavigation, .quickviewFooter, .expandButton").css({ display: "block" });
            this.$("#quickViewContent").css({ display: "block" });
        }

    };
    return workoutQVExpand;
});