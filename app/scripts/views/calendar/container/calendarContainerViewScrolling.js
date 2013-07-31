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
            this.on("scroll:updatePosition", this.onUpdateScrollPosition, this);

            this.weeksCollectionView.$el.on("scroll", _.bind(this.startScrollingState, this));
            this.weeksCollectionView.$el.on("scroll", _.bind(_.debounce(this.stopScrollingState, 500), this));

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

        scrollToDate: function(targetDate, effectDuration, callback)
        {
            if(callback) console.warn("Callback not supported on scrollToDate", callback);

            var dateAsMoment = moment(targetDate);

            if (typeof effectDuration === "undefined")
                effectDuration = 500;

            var id = dateAsMoment.format(TP.utils.datetime.shortDateFormat);
            var model = this.collection.get(id);
            this.weeksCollectionView.scrollToModel(model);

            // no need to do this as it will already update after scroll, this makes it flash twice
            //this.setCurrentDate(targetDate);
            this.snappedToWeekHeader = true;
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
