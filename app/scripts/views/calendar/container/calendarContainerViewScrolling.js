define(
[
    "underscore",
    "TP"
],
function(_, TP)
{
    var CalendarContainerViewScrolling =
    {

        scrollDownThresholdInPx: 150,
        scrollUpThresholdInPx: 100,

        initializeScrolling: function ()
        {
            _.bindAll(this, "checkCurrentScrollPosition", "afterScrollToElement");

            this.throttledCheckForPosition = _.throttle(this.checkCurrentScrollPosition, 100);

            this.on("render", this.setupScrollingOnRender, this);
        },

        setupScrollingOnRender: function()
        {
            _.bindAll(this, "onScroll");
            this.ui.weeksContainer.scroll(this.onScroll);

            _.bindAll(this, "onScrollStop");
            var debouncedScrollStop = _.debounce(this.onScrollStop, 300);
            this.ui.weeksContainer.scroll(debouncedScrollStop);


            this.checkCurrentScrollPosition();
        },

        onScrollStop: function ()
        {

            // update drop shadow of header
            this.stopScrollingState();

            // if we were already snapping to header, and browser is zoomed, it may snap a couple pixels off - ignore it and stop instead of looping
            if (this.snappingToHeader)
            {
                this.snappingToHeader = false;
                return;
            }


            // where are we now ...
            var uiOffset = this.ui.weeksContainer.offset();
            var currentWeek = $(document.elementFromPoint(uiOffset.left + 15, uiOffset.top + 15)).closest(".week");
            var nextWeek = currentWeek.next(".week");
            var weeksContainerTop = uiOffset.top;

            // can't find the elements?
            if (!currentWeek || !currentWeek.offset())
                return;

            // at some zoom levels we end up with a fraction of a pixel difference, due to all of the browser scaling calculations, so round down
            var currentWeekOffset = Math.floor(Math.abs(currentWeek.offset().top - weeksContainerTop));
            var nextWeekOffset = Math.floor(Math.abs(nextWeek.offset().top - weeksContainerTop));
            var threshhold = 100;
            var animationTimeout = 300;

            var minimumOffset = 0;
            if (currentWeekOffset > minimumOffset && currentWeekOffset <= threshhold)
            {
                this.snappingToHeader = true;
                this.scrollToElement(currentWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            }
            else if (nextWeekOffset > minimumOffset && nextWeekOffset <= threshhold)
            {
                this.snappingToHeader = true;
                this.scrollToElement(nextWeek, animationTimeout);
                this.snappedToWeekHeader = true;
            }
            else if (nextWeekOffset <= minimumOffset || currentWeekOffset <= minimumOffset)
            {
                this.snappedToWeekHeader = true;
            }
            else
            {
                this.snappedToWeekHeader = false;
            }
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
        },

        getScrollTop: function()
        {
            return this.ui.weeksContainer.scrollTop();
        },

        getHiddenHeight: function()
        {
            var howMuchIHave = this.ui.weeksContainer[0].scrollHeight;
            var howMuchIsVisible = this.ui.weeksContainer.height();
            var hidden = howMuchIHave - howMuchIsVisible;
            return hidden;
        },

        onScroll: function()
        {
            this.startScrollingState();

            var hidden = this.getHiddenHeight();
            var scrollTop = this.getScrollTop();

            if (scrollTop <= this.scrollUpThresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if (scrollTop >= (hidden - this.scrollDownThresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            this.throttledCheckForPosition();

            return;
        },

        scrollToSelector: function (selector, animationTimeout)
        {
            var elements = this.ui.weeksContainer.find(selector);
            if (elements && elements.length)
            {
                this.scrollToElement(elements[0], animationTimeout);
            }
            else
            {
                theMarsApp.logger.debug("ScollTo Selector not found: " + selector);
            }
        },

        scrollToElement: function(element, animationTimeout)
        {
            var $element = $(element);
            if ($element.is(".day"))
                $element = $element.parent();

            if (!$element.is(".week"))
                throw "Invalid scroll element - must be a .day or .week (" + $element.attr("class") + ")";

            var requestedElementOffsetFromContainer = $element.position().top;
            var scrollToOffset = Math.round(this.ui.weeksContainer.scrollTop() + requestedElementOffsetFromContainer - this.ui.weeksContainer.position().top);


            if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer < 300)
            {
                animationTimeout = 500;
            }
            else if (typeof animationTimeout === "undefined" && requestedElementOffsetFromContainer > 1500)
            {
                animationTimeout = 2000;
            }
            this.ui.weeksContainer.animate(
                {
                    scrollTop: scrollToOffset
                }, animationTimeout, this.afterScrollToElement);
        },

        afterScrollToElement: function ()
        {
            this.checkCurrentScrollPosition();
        },

        scrollToDate: function(targetDate, effectDuration)
        {
            var dateAsMoment = moment(targetDate);

            if (typeof effectDuration === "undefined")
                effectDuration = 500;

            //theMarsApp.logger.debug(dateAsMoment.format(TP.utils.datetime.shortDateFormat));
            var dateAsString = dateAsMoment.format(TP.utils.datetime.shortDateFormat);
            var selector = '.day[data-date="' + dateAsString + '"]';
            this.scrollToSelector(selector, effectDuration);
            // no need to do this as it will already update after scroll, this makes it flash twice
            //this.setCurrentDate(targetDate);
            this.snappedToWeekHeader = true;
        },

        checkCurrentScrollPosition: function ()
        {
            var scrollDate = this.getCurrentScrollDate();
            if (!scrollDate)
            {
                return;
            }
            this.setCurrentDate(scrollDate);
        },

        getCurrentScrollDate: function ()
        {
            if (!document.elementFromPoint)
                return null;

            var uiOffset = this.ui.weeksContainer.offset();
            var $currentElement = $(document.elementFromPoint(uiOffset.left + 10, uiOffset.top + 10));
            var $currentWeek = $currentElement.closest(".week");
            var $lastDayOfWeek = $currentWeek.find(".day:last");

            if ($currentWeek && $lastDayOfWeek && $lastDayOfWeek.data("date"))
            {
                return $lastDayOfWeek.data("date");
            }
            return null;
        },

        // if we un-snapped from the week header because of text wrapping on library show/hide,
        // or if we scrolled into a different week, snap back to the correct week
        scrollToLastViewedDate: function (duration)
        {
            if (typeof duration === "undefined")
            {
                duration = 100;
            }
            var headerDate = this.getHeaderDate();
            var scrollDate = this.getCurrentScrollDate();
            if (this.snappedToWeekHeader || headerDate !== scrollDate)
            {
                this.scrollToDate(moment(headerDate), duration);
            }
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

    return CalendarContainerViewScrolling;
});