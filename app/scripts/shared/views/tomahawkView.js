define(
[
    "underscore",
    "TP",
],
function(
    _,
    TP
)
{
    var TomahawkView = TP.ItemView.extend(
    {

        className: "tomahawk",
        modal: true,

        position: function(offset, target)
        {
            var self = this;
            var table =
            {
                left:
                {
                    my: "right-12 top-8",
                    at: "left top",
                    collision: "flip fit",
                    axis: "horizontal"
                },
                right:
                {
                    my: "left+12 top-8",
                    at: "right top",
                    collision: "flip fit",
                    axis: "horizontal"
                },
                top:
                {
                    my: "center bottom-12",
                    at: "center top",
                    collision: "fit flip",
                    axis: "vertical"
                },
                bottom:
                {
                    my: "center top+12",
                    at: "center bottom",
                    collision: "fit flip",
                    axis: "vertical"
                }
            };

            var options = _.clone(table[offset]);
            options.of = target;
            options.using = function(style, feedback)
            {
                self.$el.css(style);
                console.log(feedback);

                var direction = feedback[options.axis];

                var $arrow = self.$el.find(".tomahawkArrow");
                if($arrow.length === 0) $arrow = $("<div class='tomahawkArrow'/>");

                $arrow.prependTo(self.$el);
                $arrow.show();

                $arrow.after("<div class='tomahawkCover'/>");

                // Adjust for change in apparent width when rotated 45 degrees
                var shift = 5 + (Math.sqrt(2) - 1) * $arrow.width() / 2;

                var table =
                {
                    left:
                    {
                        my: "left+" + shift + " center",
                        at: "right center"
                    },
                    right:
                    {
                        my: "right-" + shift + " center",
                        at: "left center"
                    },
                    top:
                    {
                        my: "center top+" + shift,
                        at: "center bottom",
                    },
                    bottom:
                    {
                        my: "center bottom-" + shift,
                        at: "center top"
                    }
                };

                var arrowOptions = _.clone(table[direction]);
                arrowOptions.of = target;
                $arrow.position(arrowOptions);
            }

            this.$el.position(options);
        }

    });


    return TomahawkView;

});
