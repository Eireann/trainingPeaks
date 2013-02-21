define(
[
    "TP",
    "views/workoutQuickView",
    "utilities/workoutTypeName",
    "hbs!templates/views/calendarWorkout"
],
function(TP, WorkoutQuickView, workoutTypeName, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
        //className: "workout",
        className: function()
        {
            return "workout " + workoutTypeName(this.model.get("workoutTypeValueId")) + " ComplianceWarn";
        },

        attributes: function()
        {
            return {
                "data-workoutId": this.model.id
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
            if (!this.$el.data('workoutId'))
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