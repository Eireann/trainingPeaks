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
        itemView: CalendarDayView,

        // Prevent render on changes
        modelEvents: {},

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
                throw new Error("CalendarWeekView requires a model");
            this.collection = this.collection || this.model.get("week");
            if (!this.collection)
                throw new Error("CalendarWeekView requires a collection");
            this.waiting = $('<div class="calendarWeekView waiting"> </div>');

            this.listenTo(this.model, 'change:isWaiting', _.bind(this._updateWaiting, this));
        },

        _updateWaiting: function()
        {
            var isWaiting = this.model.get('isWaiting') || !this.model.get('isFetched');
            if(isWaiting)
            {
                this.onWaitStart();
            }
            else
            {
                this.onWaitStop();
            }
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
            if(!this.isWaiting) return;
            this.isWaiting = false;
            this.trigger("waitStop");
            this.$el.find('.calendarWeekView.waiting').remove('.waiting');
        },

        onRender: function()
        {
            this.renderWeekSummary();

            this.isWaiting = false;
            this._updateWaiting();
            this.setThisWeekCss();
        },

        renderWeekSummary: function()
        {
            var model = new TP.Model();
            model.collection = this.collection;

            var summary = new WeekSummaryView({ model: model });
            this.children.add(summary);
            this.$el.append(summary.el);
            summary.render();
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
