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
            var typesByName = TP.utils.workoutTypes.typesByName;
            _.each(_.keys(typesByName), function(typeName)
            {
                var typeId = typesByName[typeName];
                var selected = typeId === options.workoutTypeId ? true : false;
                types.push({ typeName: typeName, typeId: typeId, selected: selected});
            });
            this.model.set("workoutTypes", types);
        },

        template:
        {
            type: "handlebars",
            template: workoutTypeMenuTemplate
        }
    });
});