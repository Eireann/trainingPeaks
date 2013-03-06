define(
[
    "moment",
    "TP",
    "views/calendarDayView",
    "views/weekSummaryView"
],
function (moment, TP, CalendarDayView, WeekSummaryView)
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

            this.waiting = $('<div class="waiting"> </div>');

            // when any of our child views update, recalculate all of their heights
            this.height = 0;
            this.on("itemview:render", this.scheduleUpdateDayCellHeights, this);
        },

        scheduleUpdateDayCellHeights: function()
        {
            var theView = this;
            setTimeout(function()
            {
                theView.updateDayCellHeights();
            }, 1);
        },

        updateDayCellHeights: function()
        {
            var myHeight = this.$el.height();
            if (myHeight !== this.height)
            {
                this.height = myHeight;
                if (myHeight > 150)
                {
                    // use min-height instead of height, or else some days get scrollbars?
                    this.$(".day").css("min-height", myHeight);
                } else
                {
                    this.$(".day").css("min-height", 150);
                }
            }

            console.log(this.$el.height() + ", " + this.$('.weekSummary').height());
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
            this.$el.find('.waiting').remove('.waiting');
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