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

        events:
        {
            "click": "updateWorkoutDate"
        },

        updateWorkoutDate: function()
        {
            var newDate = prompt("Change Workout Date", this.model.get("WorkoutDay"));
            if (newDate)
            {
                this.model.set("WorkoutDay", newDate);
                //this.model.sync();
            }
        },

        modelEvents:
        {
            "change": "render"
        },

        initialize: function(options)
        {
            this.attributes["data-WorkoutId"] = this.model.get("WorkoutId");
        },

        onRender: function()
        {   
            this.$el.draggable({appendTo:'body', helper:'clone', cursor:'move', opacity:.7, revert:true});
        }
                                                        

    });
});