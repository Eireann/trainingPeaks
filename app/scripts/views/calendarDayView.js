define(
[
    "jqueryui/droppable",
    "underscore",
    "moment",
    "TP",
    "views/calendarWorkoutView",
    "hbs!templates/views/calendarDay"
],
function(droppable, _, moment, TP, CalendarWorkoutView, CalendarDayTemplate)
{

    var today = moment();

    return TP.ItemView.extend(
    {
        tagName: "div",
        className: "day",

        initialize: function(options)
        {
            _.bindAll(this);
            if (!this.model)
                throw "CalendarDayView needs a CalendarDayModel instance!";
        },

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
            this.appendWorkoutElements();
            this.setTodayCss();
            this.setUpDroppable();
        },

        appendWorkoutElements: function()
        {
            var workouts = this.model.getWorkouts();
            for (var i = 0; i < workouts.length; i++)
            {
                var workout = workouts.at(i);
                var workoutDate = moment(workout.get("WorkoutDay")).format("YYYY-MM-DD");
                var modelDate = this.model.id;
                
                if (workoutDate !== modelDate)
                    throw "Cannot render workout dated " + workoutDate + " to calendarDayView " + modelDate;

                var workoutView = new CalendarWorkoutView({ model: workout });
                workoutView.render();
                this.$el.append(workoutView.el);
            }
        },

        setTodayCss: function()
        {
            // so we can style today or scroll to it
            var daysAgo = this.model.get("date").diff(today, "days");
            if (daysAgo === 0)
            {
                this.$el.addClass("today");
            }
        },

        setUpDroppable: function()
        {
            this.$el.droppable({ drop: this.onDropWorkout });
        },

        onDropWorkout: function(event, ui)
        {
            this.trigger("workoutMoved", { workoutId: ui.draggable.data("workoutid"), destinationCalendarDayModel: this.model });
        }

    });
});