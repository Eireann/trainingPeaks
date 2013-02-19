define(
[
    "TP",
    "views/workoutQuickView",
    "hbs!templates/views/calendarWorkout"
],
function(TP, WorkoutQuickView, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
        className: "workout",

        attributes: function()
        {
            return {
                "data-WorkoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },

        initialize: function(options)
        {
            if (!this.model)
                throw "Cannot have a CalendarWorkoutView without a model";
        },

        events: { click: "workoutClicked" },

        workoutClicked: function () 
        {
            var view = new WorkoutQuickView({ model: this.model });
            view.render();
        },

        onRender: function()
        {
            if (!this.$el.data('WorkoutId'))
            {
                this.$el.attr(this.attributes());
            }
        }
    });
});