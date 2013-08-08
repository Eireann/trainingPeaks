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
