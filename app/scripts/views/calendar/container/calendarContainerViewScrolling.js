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
        initializeScrollOnDrag: function()
        {
            this.watchForDragging();
            this.on("updateScrollPosition", this.onUpdateScrollPosition, this);

            this.on("scroll", this.startScrollingState, this);
            this.on("scroll:stop", this.snapToHeader, this);

        },

        watchForDragging: function()
        {
            _.bindAll(this, "onDragItem", "cancelAutoScroll");

            $(document).on("drag", this.onDragItem);
            $(document).on("mouseup", this.cancelAutoScroll);

            this.on("close", function()
            {
                $(document).off("drag", this.onDragItem);
                $(document).off("mouseup", this.cancelAutoScroll);
            }, this);
        },

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

        snapToHeader: function ()
        {

            if (typeof this.ui.weeksContainer.offset === "undefined")
            {
                return;
            }

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
                this.scrollToElement(currentWeek, ".week", animationTimeout);
                this.snappedToWeekHeader = true;
            }
            else if (nextWeekOffset > minimumOffset && nextWeekOffset <= threshhold)
            {
                this.snappingToHeader = true;
                this.scrollToElement(nextWeek, ".week", animationTimeout);
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

        scrollToSelector: function (selector, animationTimeout)
        {
            var elements = this.ui.weeksContainer.find(selector);
            if (elements && elements.length)
            {
                this.scrollToElement(elements[0], ".week", animationTimeout);
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

        // if we un-snapped from the week header because of text wrapping on library show/hide,
        // or if we scrolled into a different week, snap back to the correct week
        scrollToLastViewedDate: function (duration)
        {
            if (typeof duration === "undefined")
            {
                duration = 100;
            }
            var headerDate = this.getHeaderDate();
            var scrollDate = this.getCurrentScrollDate(this.getCurrentVisibleElement());
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
        },

        onDragItem: function(e, ui)
        {
            var calendarContainer = this.ui.weeksContainer.closest("#calendarContainer");

            var calendarPosition = {
                top: calendarContainer.offset().top,
                bottom: calendarContainer.offset().top + calendarContainer.height()
            };

            var uiPosition = {
                mouse: e.pageY,
                top: ui.helper.position().top,
                bottom: ui.helper.position().top + ui.helper.height()
            };

            this.autoScrollIfNecessary(calendarPosition, uiPosition);
        },

        autoScrollIfNecessary: function(calendarPosition, uiPosition)
        {

            var topThreshold = calendarPosition.top + 10;
            var bottomThreshold = calendarPosition.bottom - 10;
            var stopThreshold = 10;
            
            if (uiPosition.top <= topThreshold)
            {
                this.trigger("autoScrollDown");
            } else if (uiPosition.bottom >= bottomThreshold)
            {
                this.trigger("autoScrollUp");
            } else if(uiPosition.top >= (topThreshold + stopThreshold) && uiPosition.bottom <= (bottomThreshold - stopThreshold))
            {
                this.cancelAutoScroll();
            }
        },

        cancelAutoScroll: function()
        {
            this.trigger("cancelAutoScroll");
        }


    };

    _.extend(CalendarContainerViewScrolling, infiniteScroll);

    return CalendarContainerViewScrolling;
});