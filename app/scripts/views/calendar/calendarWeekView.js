define(
[
    "moment",
    "setImmediate",
    "TP",
    "views/calendar/day/calendarDayView",
    "views/weekSummary/weekSummaryView",
    "hbs!templates/views/calendar/calendarWeek"
],
function(moment, setImmediate, TP, CalendarDayView, WeekSummaryView, CalendarWeek)
{
    return TP.CompositeView.extend(
    {
        tagName: "div",
        className: "week",
        getItemView: function(item)
        {
            if (!item)
                return TP.ItemView;
            if (item.isSummary)
                return WeekSummaryView;
            else
                return CalendarDayView;
        },

        template:
        {
           type: "handlebars",
           template: CalendarWeek
        },

        // override some of the default waiting functionality, because of the way css:before behaves,
        // we want the pseudo element to be containd inside the week div instead of in it's parent
        initialize: function()
        {
            if (!this.model)
                throw "CalendarWeekView requires a model";
            this.collection = this.collection || this.model.get("week");
            if (!this.collection)
                throw "CalendarWeekView requires a collection";
            this.waiting = $('<div class="calendarWeekView waiting"> </div>');

            // when any of our child views update, recalculate all of their heights
            this.on("itemview:render", this.scheduleUpdateDayCellHeights, this);
            this.model.on("library:resize", this.updateDayCellHeights, this);

            this.listenTo(this.model, 'change:isWaiting', _.bind(this._updateWaiting, this));
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
            var absoluteMinHeight = 150;
            var padding = 0;

            // start by resetting to min-height 150 in case cell height needs to shrink because we removed content
            this.$(".day").css("min-height", absoluteMinHeight);

            // then check if actual height of week div is taller, and stretch days to fit
            var myHeight = this.$el.height() + padding;
            if (myHeight > absoluteMinHeight)
            {
                // use min-height instead of height, or else some days get scrollbars?
                this.$(".day").css("min-height", myHeight);
            }
        },

        _updateWaiting: function()
        {
            var isWaiting = this.model.get('isWaiting');
            if(isWaiting) this.onWaitStart();
            else this.onWaitStop();
        },

        onWaitStart: function()
        {
            if(this.isWaiting) return;
            this.isWaiting = true;
            this.trigger("waitStart");
            this.$el.css("position", "relative");
            this.$el.append(this.waiting);
        },

        onWaitStop: function()
        {
            return;
            if(!this.isWaiting) return;
            this.isWaiting = false;
            this.trigger("waitStop");
            this.$el.find('.calendarWeekView.waiting').remove('.waiting');
        },

        onRender: function()
        {
            this._updateWaiting();
            this.setThisWeekCss();
        },

        setThisWeekCss: function ()
        {
            // so we can style today or scroll to it
            if (TP.utils.datetime.isThisWeek(this.model.id))
            {
                this.$el.addClass("thisWeek");
            }
        }

    });
});
