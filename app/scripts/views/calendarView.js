define(
[
    "backbone.marionette",
    "views/calendarDayView",
    "hbs!templates/views/calendarWeek"
],
function(Marionette, CalendarDayView, CalendarWeekTemplate)
{
    return Marionette.CollectionView.extend(
    {
        tagName: "div",
        className: "scrollable",

        itemView: CalendarDayView,

        events:
        {
            "scroll": "onscroll"
        },

        onscroll: function(event)
        {
            var howMuchIHave = this.$el[0].scrollHeight;
            var howMuchIsVisible = this.$el.height();
            var hidden = howMuchIHave - howMuchIsVisible;
            var scrollDownThresholdInPx = 150;
            var scrollUpThresholdInPx = 100;

            if (this.$el.scrollTop() <= scrollUpThresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if (this.$el.scrollTop() >= (hidden - scrollDownThresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            return;
        },

        numWeeks: 0,
        numDaysLeftForWeek: 0,

        appendHtml: function(collectionView, itemView, index)
        {

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
                collectionView.$el[insertRowFunctionName](weekHtml);
            }


            collectionView.$(".week")[findRowFunctionName]().append(itemView.el);

            // when we prepend a new week, adjust scrollTop accordingly
            if (prepend && this.numDaysLeftForWeek === 7)
            {
                this.$el.scrollTop(this.$el.scrollTop() + itemView.$el.height());
            }

            this.numDaysLeftForWeek--;
        },

        onShow: function()
        {
            this.scrollToToday();
        },

        scrollToToday: function()
        {
            // scroll so that the week before is visible
            var lastWeek = this.$el.find('.today').parent().prev();
            this.$el.scrollTop(lastWeek.offset().top - this.$el.offset().top);
        }

    });
});