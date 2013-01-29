define(
[
    "jqueryui/draggable",
    "TP",
    "hbs!templates/views/calendarWorkout"
],
function(draggable, TP, CalendarWorkoutTemplate)
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "workout",
        attributes: {},

        template:
        {
            type: "handlebars",
            template: CalendarWorkoutTemplate
        },

        modelEvents:
        {
            "change": "render"
        },

        initialize: function(options)
        {
            if (this.model)
            {
                this.attributes["data-WorkoutId"] = this.model.id;
                this.attributes.title = this.model.id + " - " + this.model.get("WorkoutDay");
            }
        },

        onRender: function()
        {
            //, revert: true 
            this.$el.draggable({ appendTo: 'body', helper: 'clone', cursor: 'move', opacity: 0.7 });
        }
                                                        

    });
});