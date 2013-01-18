define(
[
    "backbone.marionette",
    "views/calendarDayView",
    "hbs!templates/views/calendarWeek"
],
function (Marionette, CalendarDayView, CalendarWeekTemplate)
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

        onscroll: function (event)
        {
            var howMuchIHave = $(this.el)[0].scrollHeight;
            var howMuchIsVisible = $(this.el).height();
            var hidden = howMuchIHave - howMuchIsVisible;
            var thresholdInPx = 150;

            if ($(this.el).scrollTop() <= thresholdInPx)
            {
                // Within the threshold at the TOP. Add row & request data.
                this.trigger("prepend");
            }
            else if ($(this.el).scrollTop() >= (hidden - thresholdInPx))
            {
                // Within the threshold at the BOTTOM. Add row & request data.
                this.trigger("append");
            }

            return;
        },

        numWeeks: 0,
        numDaysLeftForWeek: 1,

        appendHtml: function (collectionView, itemView, index)
        {
            if (index === 0 && this.numWeeks > 0)
            {
                insertRowFunctionName = 'prepend';
                findRowFunctionName = 'first';
            } else
            {
                insertRowFunctionName = 'append';
                findRowFunctionName = 'last';
            }
            if (--this.numDaysLeftForWeek === 0)
            {
                this.numDaysLeftForWeek = 7;
                ++this.numWeeks;

                var weekHtml = CalendarWeekTemplate({});
                collectionView.$el[insertRowFunctionName](weekHtml);
            }
            collectionView.$(".row")[findRowFunctionName]().append(itemView.el);

        }
    });
});