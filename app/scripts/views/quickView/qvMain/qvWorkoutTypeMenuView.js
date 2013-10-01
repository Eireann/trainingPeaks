define(
[
    "underscore",
    "TP",
    "hbs!templates/views/quickView/workoutTypeMenu"
],
function(underscore, TP, workoutTypeMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",
        className: "workoutTypeMenu",
        
        events:
        {
            "click label": "onTypeClicked"
        },
        
        onTypeClicked: function(e)
        {
            var $label = $(e.target);
            var workoutTypeId = $label.data("workouttypeid");
            this.trigger("selectWorkoutType", workoutTypeId);
            this.close();
        },

        initialize: function(options)
        {
            this.model = new TP.Model();
            var types = [];
            _.each(TP.utils.workout.types.orderedWorkoutTypeIds, function(workoutTypeId)
            {
                var typeName = TP.utils.workout.types.getNameById(workoutTypeId);
                var selected = Number(workoutTypeId) === options.workoutTypeId ? true : false;
                types.push({ typeName: typeName, typeId: workoutTypeId, selected: selected});
            });
            this.model.set("workoutTypes", types);

            this.$el.addClass(options.direction);
        },

        template:
        {
            type: "handlebars",
            template: workoutTypeMenuTemplate
        }
    });
});