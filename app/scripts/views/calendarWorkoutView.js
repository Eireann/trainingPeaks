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

            this.makeDraggable();
        },

        makeDraggable: function()
        {
            this.$el.data("ItemId", this.model.id);
            this.$el.data("ItemType", this.model.webAPIModelName);
            this.$el.data("DropEvent", "itemMoved");
            this.$el.draggable({ appendTo: 'body', helper: 'clone', opacity: 0.7 });
        }
    });
});