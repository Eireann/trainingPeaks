define(
[
    "underscore",
    "TP",
    "utilities/infiniteScroll"
],
function(_, TP, infiniteScroll)
{
    var CalendarContainerViewScrolling =
    {

        onUpdateScrollPosition: function ($currentElement)
        {
            var scrollDate = this.getCurrentScrollDate($currentElement);
            if (!scrollDate)
            {
                return;
            }
            this.setCurrentDate(scrollDate);
        },

        getCurrentScrollDate: function ($currentElement)
        {
            if (!$currentElement)
                return;

            var $currentWeek = $currentElement.closest(".week");
            var $lastDayOfWeek = $currentWeek.find(".day:last");

            if ($currentWeek && $lastDayOfWeek && $lastDayOfWeek.data("date"))
            {
                return $lastDayOfWeek.data("date");
            }
            return null;
        },

        startScrollingState: function()
        {
            if (!this.scrolling)
            {
                this.$el.find(".daysOfWeek").addClass("scrollInProgress");
                this.scrolling = true;
            }
        },

        stopScrollingState: function()
        {
            this.scrolling = false;
            this.$el.find(".daysOfWeek").removeClass("scrollInProgress");
            this.setCurrentDate(moment(this.getCurrentWeek()));
        },

        scrollToSelector: function (selector, animationTimeout, callback)
        {
            var elements = this.ui.weeksContainer.find(selector);
            if (elements && elements.length)
            {
                this.scrollToElement(elements[0], ".week", animationTimeout, callback);
            }
            else
            {
                theMarsApp.logger.debug("ScollTo Selector not found: " + selector);
            }
        },

        scrollToDateIfNotFullyVisible: function(targetDate, effectDuration)
        {
            var dateAsString = moment(targetDate).format(TP.utils.datetime.shortDateFormat);
            var selector = '.day[data-date="' + dateAsString + '"]';

            var $week = $(selector).closest(".week");

            var weekPosition = $week.position();
            if (weekPosition && weekPosition.hasOwnProperty("top") && weekPosition.top < 30 || (weekPosition.top + $week.height() > this.ui.weeksContainer.height()))
            {
                this.scrollToDate(targetDate, effectDuration);
            }

        },


        // if we un-snapped from the week header because of text wrapping on library show/hide,
        // or if we scrolled into a different week, snap back to the correct week
        // QL: Deprecated
        scrollToLastViewedDate: function (duration)
        {
            return;
            // if (typeof duration === "undefined")
            // {
            //     duration = 100;
            // }
            // var headerDate = this.getHeaderDate();
            // var scrollDate = this.getCurrentScrollDate(this.getCurrentVisibleElement());
            // if (this.snappedToWeekHeader || headerDate !== scrollDate)
            // {
            //     this.scrollToDate(moment(headerDate), duration);
            // }
        },

        getHeaderDate: function()
        {
            return this.calendarHeaderModel.get("date");
        },

        setCurrentDate: function(currentDate)
        {
            var dateAsMoment = moment(currentDate);
            var endOfWeek = this.startOfWeekDayIndex === 0 ? 6 : 0;
            if (dateAsMoment.day() !== endOfWeek)
                dateAsMoment.day(this.startOfWeekDayIndex + 6);

            if (currentDate)
                this.calendarHeaderModel.set("date", dateAsMoment.format(TP.utils.datetime.shortDateFormat));
        }

    };

    _.extend(CalendarContainerViewScrolling, infiniteScroll);

    return CalendarContainerViewScrolling;
});
