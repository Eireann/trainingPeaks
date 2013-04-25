define(
[
    "underscore",
    "TP"
],
function (
    _,
    TP
)
{
    var workoutQVExpand = {

        events:
        {
            "click #quickViewExpandDiv": "expandClicked",
            "click #quickViewCollapseDiv": "collapseClicked"
        },


        expandClicked: function ()
        {
            var windowHeight = $(window).height();
            var windowWidth = $(window).width();



            this.animate(windowHeight, windowWidth);
        },

        animate: function(windowHeight, windowWidth)
        {
            var duration = 300;
            var newHeight = windowHeight * 0.95;
            var newWidth = windowWidth * 0.95;
            this.$el.animate({ height: newHeight, width: newWidth, top: "20px", left: "20px" }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: duration });
            this.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon, .expandButton").css({ display: "none" });
            this.$(".collapseButton").css({ display: "block" });
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