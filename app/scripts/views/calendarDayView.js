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
        workoutViews: null,

        initialize: function(options)
        {
            _.bindAll(this);
            if (!this.model)
                throw "CalendarDayView needs a CalendarDayModel instance!";
            this.workoutViews = [];
        },

        onWaitStart: function()
        {
            this.trigger("waitStart");
            this.$el.addClass('waiting');
        },

        onWaitStop: function()
        {
            this.trigger("waitStop");
            this.$el.removeClass('waiting');
        },

        template:
        {
            type: "handlebars",
            template: CalendarDayTemplate
        },

        modelEvents:
        {
            "change": "render",
            "waitStart": "onWaitStart",
            "waitStop": "onWaitStop"
        },

        onRender: function()
        {
            this.cleanupWorkoutViewBindings();
            this.appendWorkoutElements();
            this.setTodayCss();
            this.setUpDroppable();
        },

        cleanupWorkoutViewBindings: function()
        {
            _.each(this.workoutViews, function(workoutView)
            {
                workoutView.close();
            });
            this.workoutViews = [];
        },

        appendWorkoutElements: function()
        {
            var workouts = this.model.getWorkouts();
            for (var i = 0; i < workouts.length; i++)
            {
                var workout = workouts.at(i);
                var workoutDate = moment(workout.get("WorkoutDay")).format("YYYY-MM-DD");
                var modelDate = this.model.id;

                var workoutView = new CalendarWorkoutView({ model: workout });
                workoutView.on("waitStart", this.onWaitStart);
                workoutView.on("waitStop", this.onWaitStop);
                this.workoutViews.push(workoutView);
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