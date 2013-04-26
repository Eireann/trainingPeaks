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
            
            this.$el.animate({ height: newHeight, width: newWidth, top: "20px", left: "20px" }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: duration });
            this.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon, .expandButton").css({ display: "none" });
            this.$(".collapseButton, .expandedViewsButtons").css({ display: "block" });
            this.$(".viewOne, .viewTwo").css({ width: viewsWidth, height: viewsHeight });
        },

        collapseClicked: function ()
        {
            var duration = 300;
            this.$el.animate({ height: 600, width: 800 }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: 600, width: 800 }, { duration: duration });
            this.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon, .expandButton").css({ display: "block" });
            this.$(".collapseButton").css({ display: "none" });
        }

    };
    return workoutQVExpand;
});