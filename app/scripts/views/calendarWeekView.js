define(
[
    "moment",
    "setImmediate",
    "TP",
    "views/calendarDayView",
    "views/weekSummaryView"
],
function(moment, setImmediate, TP, CalendarDayView, WeekSummaryView)
{
    return TP.CollectionView.extend(
    {
        tagName: "div",
        className: "week",
        getItemView: function(item)
        {
            if (item.isSummary)
                return WeekSummaryView;
            else
                return CalendarDayView;
        },

        // override some of the default waiting functionality, because of the way css:before behaves,
        // we want the pseudo element to be containd inside the week div instead of in it's parent
        initialize: function()
        {
            if (!this.model)
                throw "CalendarWeekView requires a model";

            if (!this.collection)
                throw "CalendarWeekView requires a collection";

            this.waiting = $('<div class="calendarWeekView waiting"> </div>');

            // when any of our child views update, recalculate all of their heights
            this.on("itemview:render", this.scheduleUpdateDayCellHeights, this);
        },

        scheduleUpdateDayCellHeights: function()
        {
            // as a timeout, because on the initial render of weeksummary, and probably some other elements, height is not calculated until it's painted,
            var theView = this;
            setImmediate(function()
            {
                theView.updateDayCellHeights();
            });
        },

        updateDayCellHeights: function()
        {
            // start by resetting to min-height 150 in case cell height needs to shrink because we removed content
            this.$(".day").css("min-height", 150);

            // then check if actual height of week div is taller, and stretch days to fit
            var myHeight = this.$el.height();
            if (myHeight > 150)
            {
               // use min-height instead of height, or else some days get scrollbars?
                this.$(".day").css("min-height", myHeight);
            }
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.$el.css("position", "relative");
            this.$el.append(this.waiting);
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.$el.find('.calendarWeekView.waiting').remove('.waiting');
        },

        onRender: function()
        {
            this.setThisWeekCss();
        },

        setThisWeekCss: function ()
        {
            // so we can style today or scroll to it
            var today = moment();
            var weekDate = moment(this.model.id);
            if (weekDate.week() === today.week() && weekDate.year() === today.year())
            {
                this.$el.addClass("thisWeek");
         
            }
        }

    });
});