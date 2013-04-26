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

            this.$el.animate({ height: newHeight, width: newWidth, top: top + "px", left: left + "px" }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: duration });
            this.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon, .expandButton").css({ display: "none" });
            this.$("#quickViewExpandedContent, .collapseButton, .expandedViewsButtons").css({ display: "block" });
            this.$(".viewOne, .viewTwo").css({ width: viewsWidth, height: viewsHeight });
        },

        collapseClicked: function ()
        {
            var duration = 300;
            this.$el.animate({
                height: this.originalPosition.height,
                width: this.originalPosition.width,
                top: this.originalPosition.top + "px",
                left: this.originalPosition.left + "px"
            }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: this.originalPosition.height, width: this.originalPosition.width }, { duration: duration });
            this.$(".tabNavigation, #quickViewContent, .quickviewFooter, .expandButton").css({ display: "block" });
            this.$("#menuIcon").css({ display: "" });
            this.$("#quickViewExpandedContent, .collapseButton, .expandedViewsButtons").css({ display: "none" });
        }

    };
    return workoutQVExpand;
});