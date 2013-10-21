﻿define(
[
    "jqueryui/tooltip"
], function(
    jqueryTooltip
    )
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
            // too far right, move it left
            position.left = position.left + targetElement.outerWidth() - self.outerWidth();
            self.find(".arrow").css(cssLeftProperty, self.outerWidth() - (targetElement.outerWidth() / 2) - 10);
        }
        else
        {
            position.left = position.left + (targetElement.outerWidth() / 2) - (self.outerWidth() / 2);
        }

        // move the tooltip a little further away from the element
        var extraOffset = 1;

        if (self.hasClass("above"))
        {
            position.top -= self.outerHeight();
            position.top -= extraOffset;
        } else
        {
            position.top += targetElement.outerHeight();
            position.top += extraOffset;
        }

        self.css(position);
    };

    return {

        initTooltips: function()
        {
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
        },

        enableTooltips: function()
        {
            $(document).tooltip("enable");
        },

        disableTooltips: function()
        {
            $(document).tooltip("disable");
        }
    };
});