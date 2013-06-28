define(
[
    "jqueryui/tooltip"
], function(
    jqueryTooltip
    )
{

        return function()
        {
            var tooltipPositioner = function(position, feedback)
            {

                var self = $(this);
                var targetElement = $(feedback.target.element);
                var cssLeftProperty = "left";
                position = targetElement.offset();

                // add an arrow
                if (self.find(".arrow").length === 0)
                {
                    var arrow = $("<div>").addClass("arrow");
                    self.append(arrow);
                    self.html(self.html().replace(/\n/g, "<br />"));
                    if (position.top <= ($(window).outerHeight() - 50))
                    {
                        self.addClass("below");

                    }
                    else
                    {
                        self.addClass("above");
                        cssLeftProperty = "margin-left";
                    }
                }

                if (position.left > $(window).outerWidth() - 100)
                {
                    position.left = position.left + targetElement.outerWidth() - self.outerWidth();
                    self.find(".arrow").css(cssLeftProperty, self.outerWidth() - (targetElement.outerWidth() / 2) - 10);
                }
                else if (position.left < 100)
                {
                    self.find(".arrow").css(cssLeftProperty, (targetElement.outerWidth() / 2) - 10);
                }
                else
                {
                    position.left = position.left + (targetElement.outerWidth() / 2) - (self.outerWidth() / 2);
                }


                if (self.hasClass("above"))
                {
                    position.top -= self.outerHeight();
                } else
                {
                    position.top += targetElement.outerHeight();
                }

                self.css(position);
            };

            $(document).tooltip(
            {
                position:
                {
                    using: tooltipPositioner
                },

                show:
                {
                    delay: 500
                },

                track: false
            });
        };

});