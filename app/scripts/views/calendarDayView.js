define(
[
    "moment",
    "backbone.marionette",
    "views/calendarWorkoutView",
    "hbs!templates/views/calendarDay"
],
function(moment, Marionette, CalendarWorkoutView, CalendarDayTemplate)
{

    var today = moment();

    return Marionette.ItemView.extend(
    {
        tagName: "div",
        className: "day",

        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        },

        modelEvents:
        {
            "change": "render"
        },

        onRender: function()
        {
            this.appendWorkoutElement();
            this.setTodayCss();
        },

        appendWorkoutElement: function() {

            var workout = this.model.get("workout");
            if (workout)
            {
                var workoutView = new CalendarWorkoutView({ model: workout });
                workoutView.render();
                this.$el.append(workoutView.el);
            }
        },

        setTodayCss: function() {
            // so we can style today or scroll to it
            var daysAgo = this.model.get("date").diff(today, "days");
            if (daysAgo === 0)
            {
                this.$el.addClass("today");
            }
        }

    });
});