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
            "click #quickViewExpandDiv": "expandClicked"
            
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
            var newHeight = windowHeight * .95;
            var newWidth = windowWidth * .95;
            this.$el.animate({ height: newHeight, width: newWidth, top: "20px", left: "20px" }, { duration: duration });
            this.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: duration });
        }

    };
    return workoutQVExpand;
});