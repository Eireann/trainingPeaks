define(
[
    "underscore",
    "TP",
    "views/calendarDayView",
    "hbs!templates/views/calendar",
    "hbs!templates/views/calendarWeek"
],
function(_, TP, CalendarDayView, CalendarTemplate, CalendarWeekTemplate)
{
    return TP.CompositeView.extend(
    {
        tagName: 'div',
        itemView: CalendarDayView,
        itemViewContainer: "#weeksContainer",
        numWeeks: 0,
        numDaysLeftForWeek: 0,
        $weeksContainer: null,

        template:
        {
            type: "handlebars",
            template: CalendarTemplate
        },

        ui:
        {
            "weeksContainer": "#weeksContainer"
        },

        events:
        {
            "scroll": "onscroll"
        },

        onRender: function()
        {
            this.initWeeksContainer();
            _.bind(this, "onWorkoutMoved");
        },

        onscroll: function(event)
        {
            var howMuchIHave = this.$weeksContainer[0].scrollHeight;
            var howMuchIsVisible = this.$weeksContainer.height();
            var hidden = howMuchIHave - howMuchIsVisible;
            var scrollDownThresholdInPx = 150;
            var scrollUpThresholdInPx = 100;

            if (this.$weeksContainer.scrollTop() <= scrollUpThresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if (this.$weeksContainer.scrollTop() >= (hidden - scrollDownThresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            return;
        },

        initWeeksContainer: function() {
            if (!this.$weeksContainer)
            {
                this.$weeksContainer = this.$(this.ui.weeksContainer);
                _.bindAll(this, 'onscroll');
                this.$weeksContainer.scroll(this.onscroll);
            }
            return this.$weeksContainer;
        },

        appendHtml: function(collectionView, itemView, index)
        {
            this.initWeeksContainer();

            var prepend = false;

            if (index === 0 && this.numWeeks > 0)
            {
                prepend = true;
            }


            if (prepend)
            {
                insertRowFunctionName = 'prepend';
                findRowFunctionName = 'first';
            } else
            {
                insertRowFunctionName = 'append';
                findRowFunctionName = 'last';
            }

            if (this.numDaysLeftForWeek === 0)
            {
                this.numDaysLeftForWeek = 7;
                ++this.numWeeks;

                var weekHtml = CalendarWeekTemplate({});
                this.$weeksContainer[insertRowFunctionName](weekHtml);
            }


            this.$weeksContainer.find(".week")[findRowFunctionName]().append(itemView.el);

            // when we prepend a new week, adjust scrollTop accordingly
            if (prepend && this.numDaysLeftForWeek === 7)
            {
                this.$weeksContainer.scrollTop(this.$weeksContainer.scrollTop() + itemView.$el.height());
            }

            this.numDaysLeftForWeek--;

            itemView.bind("workoutMoved", this.onWorkoutMoved);
        },

        // onShow instead of onRender, because in onRender we may not be visible in document yet, no offsets calculated
        onShow: function()
        {
            this.scrollToToday();
        },

        scrollToToday: function()
        {
            // scroll so that the week before is visible
            var today = this.$weeksContainer.find('.today');
            if (today.length > 0)
            {
                var thisWeek = today.parent();
                var lastWeek = thisWeek.prev();
                var weekTop = lastWeek && lastWeek.offset() ? lastWeek.offset().top : thisWeek.offset().top;
                this.$weeksContainer.scrollTop(weekTop - this.$weeksContainer.offset().top);
            }
        },

        onWorkoutMoved: function (workoutid, calendarDayModel)
        {
            console.log("calendarView");
            this.trigger("workoutMoved", workoutid, calendarDayModel);
        }

    });
});